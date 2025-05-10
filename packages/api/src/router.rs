use axum::{
    routing::{get, post, delete, put},
    Router,
};
use sqlx::PgPool;
use tower_http::cors::{Any, CorsLayer};

use crate::handlers::todo;
use crate::handlers::repository;

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
        .route("/api/todos/:id", get(todo::get_todo))
        .route("/api/todos/:id", put(todo::update_todo))
        .route("/api/todos/:id", delete(todo::delete_todo))
        
        // Repository routes
        .route("/api/repositories", get(repository::get_repositories))
        .route("/api/repositories", post(repository::create_repository))
        .route("/api/repositories/:id", get(repository::get_repository))
        .route("/api/repositories/:id", put(repository::update_repository))
        .route("/api/repositories/:id", delete(repository::delete_repository))
        
        // Health check route
        .route("/health", get(|| async { "OK" }))
        
        // Apply CORS middleware
        .layer(cors)
        
        // Pass database connection to all handlers
        .with_state(pool)
}