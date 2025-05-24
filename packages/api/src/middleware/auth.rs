use axum::{
    extract::{Request, State},
    http::header,
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    app_state::AppState,
    error::{ApiError, Result},
    models::User,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

pub async fn auth_middleware(
    State(app_state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response> {
    let token = extract_token(&request)?;

    let token_data = decode::<Claims>(
        &token,
        &DecodingKey::from_secret(app_state.auth_config.jwt_secret.as_ref()),
        &Validation::default(),
    )
    .map_err(|e| ApiError::Unauthorized(format!("Invalid token: {}", e)))?;

    let user_id = Uuid::parse_str(&token_data.claims.sub)
        .map_err(|e| ApiError::Unauthorized(format!("Invalid user ID in token: {}", e)))?;

    let user = sqlx::query_as::<_, User>(
        "SELECT id, github_id, username, name, email, avatar_url, access_token, created_at, updated_at FROM users WHERE id = $1"
    )
    .bind(user_id)
    .fetch_one(&*app_state.pool)
    .await
    .map_err(|_| ApiError::Unauthorized("User not found".to_string()))?;

    request.extensions_mut().insert(user);

    Ok(next.run(request).await)
}

fn extract_token(request: &Request) -> Result<String> {
    let auth_header = request
        .headers()
        .get(header::AUTHORIZATION)
        .ok_or_else(|| ApiError::Unauthorized("Authorization header missing".to_string()))?
        .to_str()
        .map_err(|_| ApiError::Unauthorized("Invalid authorization header".to_string()))?;

    if !auth_header.starts_with("Bearer ") {
        return Err(ApiError::Unauthorized(
            "Authorization header must start with Bearer".to_string(),
        ));
    }

    Ok(auth_header[7..].to_string())
}
