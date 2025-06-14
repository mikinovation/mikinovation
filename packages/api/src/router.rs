use axum::{
    middleware,
    routing::{delete, get, post, put},
    Router,
};
use sqlx::PgPool;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

use crate::{
    app_state::AppState,
    handlers::{auth, label, repository, repository_label, todo},
    middleware::auth::auth_middleware,
};

pub fn create_router(pool: PgPool) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app_state = AppState {
        pool: Arc::new(pool),
        auth_config: Arc::new(auth::AuthConfig {
            github_client_id: std::env::var("GITHUB_CLIENT_ID")
                .unwrap_or_else(|_| "dummy_client_id".to_string()),
            github_client_secret: std::env::var("GITHUB_CLIENT_SECRET")
                .unwrap_or_else(|_| "dummy_client_secret".to_string()),
            jwt_secret: std::env::var("JWT_SECRET")
                .unwrap_or_else(|_| "dummy_jwt_secret_for_development_only".to_string()),
            frontend_url: std::env::var("FRONTEND_URL")
                .unwrap_or_else(|_| "http://localhost:5173".to_string()),
        }),
    };

    let public_routes = Router::new()
        .route("/health", get(|| async { "OK" }))
        .route("/api/auth/github", get(auth::github_auth))
        .route("/api/auth/github/callback", get(auth::github_callback))
        .with_state(app_state.clone());

    let pool = (*app_state.pool).clone();

    let user_routes = Router::new()
        .route("/api/user", get(auth::get_current_user))
        .layer(middleware::from_fn_with_state(
            app_state.clone(),
            auth_middleware,
        ))
        .with_state((*app_state.pool).clone());

    let protected_routes = Router::new()
        .route("/api/todos", get(todo::get_todos))
        .route("/api/todos", post(todo::create_todo))
        .route("/api/todos/{id}", get(todo::get_todo))
        .route("/api/todos/{id}", put(todo::update_todo))
        .route("/api/todos/{id}", delete(todo::delete_todo))
        .route("/api/repositories", get(repository::get_repositories))
        .route("/api/repositories", post(repository::create_repository))
        .route("/api/repositories/{id}", get(repository::get_repository))
        .route("/api/repositories/{id}", put(repository::update_repository))
        .route(
            "/api/repositories/{id}",
            delete(repository::delete_repository),
        )
        .route("/api/labels", get(label::get_labels))
        .route("/api/labels", post(label::create_label))
        .route("/api/labels/{id}", get(label::get_label))
        .route("/api/labels/{id}", put(label::update_label))
        .route("/api/labels/{id}", delete(label::delete_label))
        .route(
            "/api/repositories/{id}/labels",
            get(repository_label::get_repository_labels),
        )
        .route(
            "/api/repositories/{id}/labels",
            post(repository_label::add_label_to_repository),
        )
        .route(
            "/api/repositories/{id}/labels/{label_id}",
            delete(repository_label::remove_label_from_repository),
        )
        .route(
            "/api/labels/{id}/repositories",
            get(repository_label::get_repositories_by_label),
        )
        .layer(middleware::from_fn_with_state(
            app_state.clone(),
            auth_middleware,
        ))
        .with_state(pool);

    Router::new()
        .merge(public_routes)
        .merge(user_routes)
        .merge(protected_routes)
        .layer(cors)
}
