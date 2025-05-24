use axum::{
    extract::{Query, State},
    response::{IntoResponse, Redirect},
    Extension,
};
use oauth2::{
    basic::BasicClient, AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken, Scope,
    TokenResponse, TokenUrl,
};
use serde::{Deserialize, Serialize};

type GitHubOAuthClient = oauth2::Client<
    oauth2::StandardErrorResponse<oauth2::basic::BasicErrorResponseType>,
    oauth2::StandardTokenResponse<oauth2::EmptyExtraTokenFields, oauth2::basic::BasicTokenType>,
    oauth2::StandardTokenIntrospectionResponse<
        oauth2::EmptyExtraTokenFields,
        oauth2::basic::BasicTokenType,
    >,
    oauth2::StandardRevocableToken,
    oauth2::StandardErrorResponse<oauth2::RevocationErrorResponseType>,
    oauth2::EndpointSet,
    oauth2::EndpointNotSet,
    oauth2::EndpointNotSet,
    oauth2::EndpointNotSet,
    oauth2::EndpointSet,
>;

use crate::{
    app_state::AppState,
    db::DbPool,
    error::{ApiError, Result},
    models::{GitHubUser, User},
};

#[derive(Clone)]
pub struct AuthConfig {
    pub github_client_id: String,
    pub github_client_secret: String,
    pub jwt_secret: String,
    pub frontend_url: String,
}

#[derive(Deserialize)]
pub struct AuthRequest {
    // TODO: Support custom redirect URI in the future
    #[allow(dead_code)]
    pub redirect_uri: Option<String>,
}

#[derive(Deserialize)]
pub struct CallbackQuery {
    pub code: String,
    // State parameter for CSRF protection (to be implemented)
    #[allow(dead_code)]
    pub state: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: User,
}

pub async fn github_auth(
    State(app_state): State<AppState>,
    Query(_query): Query<AuthRequest>,
) -> Result<impl IntoResponse> {
    let client = create_oauth_client(&app_state.auth_config)?;

    let (auth_url, _csrf_token) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("read:user".to_string()))
        .add_scope(Scope::new("user:email".to_string()))
        .url();

    Ok(Redirect::to(auth_url.as_str()))
}

pub async fn github_callback(
    State(app_state): State<AppState>,
    Query(query): Query<CallbackQuery>,
) -> Result<impl IntoResponse> {
    let client = create_oauth_client(&app_state.auth_config)?;

    let http_client = reqwest::Client::new();
    let token_result = client
        .exchange_code(AuthorizationCode::new(query.code))
        .request_async(&http_client)
        .await
        .map_err(|e| ApiError::InternalServerError(format!("Failed to exchange code: {}", e)))?;

    let access_token = token_result.access_token().secret();

    let github_user = fetch_github_user(access_token).await?;

    let user = upsert_user(&app_state.pool, github_user, access_token.to_string()).await?;

    let jwt_token = generate_jwt(&user, &app_state.auth_config.jwt_secret)?;

    let redirect_url = format!(
        "{}/auth/callback?token={}",
        app_state.auth_config.frontend_url, jwt_token
    );

    Ok(Redirect::to(&redirect_url))
}

fn create_oauth_client(auth_config: &AuthConfig) -> Result<GitHubOAuthClient> {
    let github_client_id = ClientId::new(auth_config.github_client_id.clone());
    let github_client_secret = ClientSecret::new(auth_config.github_client_secret.clone());
    let auth_url = AuthUrl::new("https://github.com/login/oauth/authorize".to_string())
        .map_err(|e| ApiError::InternalServerError(format!("Invalid auth URL: {}", e)))?;
    let token_url = TokenUrl::new("https://github.com/login/oauth/access_token".to_string())
        .map_err(|e| ApiError::InternalServerError(format!("Invalid token URL: {}", e)))?;

    let client = BasicClient::new(github_client_id)
        .set_client_secret(github_client_secret)
        .set_auth_uri(auth_url)
        .set_token_uri(token_url);

    Ok(client)
}

async fn fetch_github_user(access_token: &str) -> Result<GitHubUser> {
    let client = reqwest::Client::new();
    let response = client
        .get("https://api.github.com/user")
        .header("Authorization", format!("Bearer {}", access_token))
        .header("User-Agent", "mikinovation-api")
        .send()
        .await
        .map_err(|e| {
            ApiError::InternalServerError(format!("Failed to fetch GitHub user: {}", e))
        })?;

    if !response.status().is_success() {
        return Err(ApiError::InternalServerError(format!(
            "GitHub API returned status: {}",
            response.status()
        )));
    }

    response
        .json::<GitHubUser>()
        .await
        .map_err(|e| ApiError::InternalServerError(format!("Failed to parse GitHub user: {}", e)))
}

async fn upsert_user(pool: &DbPool, github_user: GitHubUser, access_token: String) -> Result<User> {
    let user = User::from_github(github_user, access_token);

    let result = sqlx::query_as::<_, User>(
        r#"
        INSERT INTO users (id, github_id, username, name, email, avatar_url, access_token, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (github_id) DO UPDATE SET
            username = EXCLUDED.username,
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            avatar_url = EXCLUDED.avatar_url,
            access_token = EXCLUDED.access_token,
            updated_at = EXCLUDED.updated_at
        RETURNING id, github_id, username, name, email, avatar_url, access_token, created_at, updated_at
        "#
    )
    .bind(user.id)
    .bind(user.github_id)
    .bind(user.username)
    .bind(user.name)
    .bind(user.email)
    .bind(user.avatar_url)
    .bind(user.access_token)
    .bind(user.created_at)
    .bind(user.updated_at)
    .fetch_one(pool)
    .await
    .map_err(|e| ApiError::InternalServerError(format!("Failed to upsert user: {}", e)))?;

    Ok(result)
}

fn generate_jwt(user: &User, jwt_secret: &str) -> Result<String> {
    use jsonwebtoken::{encode, EncodingKey, Header};

    #[derive(Debug, Serialize)]
    struct Claims {
        sub: String,
        exp: usize,
    }

    let expiration = chrono::Utc::now()
        .checked_add_signed(chrono::Duration::days(7))
        .ok_or_else(|| ApiError::InternalServerError("Failed to calculate expiration".to_string()))?
        .timestamp() as usize;

    let claims = Claims {
        sub: user.id.to_string(),
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_ref()),
    )
    .map_err(|e| ApiError::InternalServerError(format!("Failed to generate JWT: {}", e)))
}

pub async fn get_current_user(Extension(user): Extension<User>) -> Result<impl IntoResponse> {
    Ok(axum::Json(user))
}
