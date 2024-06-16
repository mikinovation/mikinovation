use axum::{
    http::StatusCode,
    routing::{get, post},
    Router,
    Json
};
use serde::{Deserialize, Serialize};

pub struct AppRouter;

impl AppRouter {
    pub fn new() -> Router {
      Router::new()
        .route("/", get(root))
        .route("/users", post(create_user))
    }
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
  use axum::{
      body::Body,
      http::{Request, Method, StatusCode}
  };

  #[tokio::test]
  async fn test_root() {
     let request = Request::builder()
         .method(Method::GET)
         .uri("/")
         .body(Body::empty())
         .unwrap();

     let response = AppRouter::new()
         .oneshot(request)
         .await
         .unwrap();

      assert_eq!(response.status(), StatusCode::OK);
      assert_eq!(response.into_body().collect().await.unwrap().to_bytes(), "Hello, World!");
  }
}
