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
    handlers::{auth, compat},
    middleware::auth::auth_middleware,
};

pub fn create_router(pool: PgPool) -> Router {
    // CORS settings
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Create app state
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

    // Public routes (no auth required)
    let public_routes = Router::new()
        .route("/health", get(|| async { "OK" }))
        .route("/api/auth/github", get(auth::github_auth))
        .route("/api/auth/github/callback", get(auth::github_callback))
        .with_state(app_state.clone());

    // Protected routes (auth required)
    let protected_routes = Router::new()
        // Todo routes
        .route("/api/todos", get(compat::get_todos))
        .route("/api/todos", post(compat::create_todo))
        .route("/api/todos/{id}", get(compat::get_todo))
        .route("/api/todos/{id}", put(compat::update_todo))
        .route("/api/todos/{id}", delete(compat::delete_todo))
        // Repository routes
        .route("/api/repositories", get(compat::get_repositories))
        .route("/api/repositories", post(compat::create_repository))
        .route("/api/repositories/{id}", get(compat::get_repository))
        .route("/api/repositories/{id}", put(compat::update_repository))
        .route("/api/repositories/{id}", delete(compat::delete_repository))
        // Label routes
        .route("/api/labels", get(compat::get_labels))
        .route("/api/labels", post(compat::create_label))
        .route("/api/labels/{id}", get(compat::get_label))
        .route("/api/labels/{id}", put(compat::update_label))
        .route("/api/labels/{id}", delete(compat::delete_label))
        // Repository-Label relationship routes
        .route(
            "/api/repositories/{id}/labels",
            get(compat::get_repository_labels),
        )
        .route(
            "/api/repositories/{id}/labels",
            post(compat::add_label_to_repository),
        )
        .route(
            "/api/repositories/{id}/labels/{label_id}",
            delete(compat::remove_label_from_repository),
        )
        .route(
            "/api/labels/{id}/repositories",
            get(compat::get_repositories_by_label),
        )
        .layer(middleware::from_fn_with_state(
            app_state.clone(),
            auth_middleware,
        ))
        .with_state(app_state.clone());

    // Combine public and protected routes
    Router::new()
        .merge(public_routes)
        .merge(protected_routes)
        .layer(cors)
        .with_state(app_state)
}
