use axum::{
    http::StatusCode,
    routing::{get, post},
    Json, Router,
    http::{header, Method, Request}
};
use serde::{Deserialize, Serialize};
use tracing_subscriber;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = create_app();

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3418").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

fn create_app() -> Router {
    Router::new()
        .route("/", get(root))
        .route("/users", post(create_user))
}

async fn root() -> &'static str {
    "Hello, World!"
}

async fn create_user(
    Json(payload): Json<CreateUser>,
) -> (StatusCode, Json<User>) {
    let user = User {
        id: 1337,
        username: payload.username,
    };

    (StatusCode::CREATED, Json(user))
}

#[derive(Deserialize)]
struct CreateUser {
    username: String,
}

#[derive(Serialize)]
struct User {
    id: u64,
    username: String,
}

#[cfg(test)]
mod test {
  use super::*;
  use tower::ServiceExt;
  use http_body_util::BodyExt;
  use axum::body::Body;

  #[tokio::test]
  async fn test_root() {
     let request = Request::builder()
         .method(Method::GET)
         .uri("/")
         .body(Body::empty())
         .unwrap();

     let response = create_app()
         .oneshot(request)
         .await
         .unwrap();

      assert_eq!(response.status(), StatusCode::OK);
      assert_eq!(response.into_body().collect().await.unwrap().to_bytes(), "Hello, World!");
  }
}
