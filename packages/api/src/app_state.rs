use std::sync::Arc;

use crate::{db::DbPool, handlers::auth::AuthConfig};

#[derive(Clone)]
pub struct AppState {
    pub pool: Arc<DbPool>,
    pub auth_config: Arc<AuthConfig>,
}
