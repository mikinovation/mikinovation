use axum::{
    routing::{delete, get, post, put},
    Router,
};
use sqlx::PgPool;
use tower_http::cors::{Any, CorsLayer};

use crate::handlers::{label, repository, repository_label, todo};

pub fn create_router(pool: PgPool) -> Router {
    // CORS settings
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Create a router
    Router::new()
        // Todo routes
        .route("/api/todos", get(todo::get_todos))
        .route("/api/todos", post(todo::create_todo))
        .route("/api/todos/{id}", get(todo::get_todo))
        .route("/api/todos/{id}", put(todo::update_todo))
        .route("/api/todos/{id}", delete(todo::delete_todo))
        // Repository routes
        .route("/api/repositories", get(repository::get_repositories))
        .route("/api/repositories", post(repository::create_repository))
        .route("/api/repositories/{id}", get(repository::get_repository))
        .route("/api/repositories/{id}", put(repository::update_repository))
        .route(
            "/api/repositories/{id}",
            delete(repository::delete_repository),
        )
        // Label routes
        .route("/api/labels", get(label::get_labels))
        .route("/api/labels", post(label::create_label))
        .route("/api/labels/{id}", get(label::get_label))
        .route("/api/labels/{id}", put(label::update_label))
        .route("/api/labels/{id}", delete(label::delete_label))
        // Repository-Label relationship routes
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
        // Health check route
        .route("/health", get(|| async { "OK" }))
        // Apply CORS middleware
        .layer(cors)
        // Pass database connection to all handlers
        .with_state(pool)
}
