mod routers;

use tracing_subscriber;
use routers::{AppRouter};

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = AppRouter::new();

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3418").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
