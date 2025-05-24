use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};

use crate::{
    app_state::AppState,
    error::ApiError,
    models::{
        AddLabelToRepository, CreateLabel, CreateRepository, CreateTodo, Label, Repository, Todo,
        UpdateLabel, UpdateRepository, UpdateTodo,
    },
};

pub async fn get_todos(State(app_state): State<AppState>) -> Result<Json<Vec<Todo>>, ApiError> {
    super::todo::get_todos(State((*app_state.pool).clone())).await
}

pub async fn get_todo(
    State(app_state): State<AppState>,
    path: Path<String>,
) -> Result<Json<Todo>, ApiError> {
    super::todo::get_todo(State((*app_state.pool).clone()), path).await
}

pub async fn create_todo(
    State(app_state): State<AppState>,
    Json(create_todo): Json<CreateTodo>,
) -> Result<(StatusCode, Json<Todo>), ApiError> {
    super::todo::create_todo(State((*app_state.pool).clone()), Json(create_todo)).await
}

pub async fn update_todo(
    State(app_state): State<AppState>,
    path: Path<String>,
    Json(update_todo): Json<UpdateTodo>,
) -> Result<Json<Todo>, ApiError> {
    super::todo::update_todo(State((*app_state.pool).clone()), path, Json(update_todo)).await
}

pub async fn delete_todo(
    State(app_state): State<AppState>,
    path: Path<String>,
) -> Result<StatusCode, ApiError> {
    super::todo::delete_todo(State((*app_state.pool).clone()), path).await
}

// Repository handlers
pub async fn get_repositories(
    State(app_state): State<AppState>,
) -> Result<Json<Vec<Repository>>, ApiError> {
    super::repository::get_repositories(State((*app_state.pool).clone())).await
}

pub async fn get_repository(
    State(app_state): State<AppState>,
    path: Path<String>,
) -> Result<Json<Repository>, ApiError> {
    super::repository::get_repository(State((*app_state.pool).clone()), path).await
}

pub async fn create_repository(
    State(app_state): State<AppState>,
    Json(create_repository): Json<CreateRepository>,
) -> Result<(StatusCode, Json<Repository>), ApiError> {
    super::repository::create_repository(State((*app_state.pool).clone()), Json(create_repository))
        .await
}

pub async fn update_repository(
    State(app_state): State<AppState>,
    path: Path<String>,
    Json(update_repository): Json<UpdateRepository>,
) -> Result<Json<Repository>, ApiError> {
    super::repository::update_repository(
        State((*app_state.pool).clone()),
        path,
        Json(update_repository),
    )
    .await
}

pub async fn delete_repository(
    State(app_state): State<AppState>,
    path: Path<String>,
) -> Result<StatusCode, ApiError> {
    super::repository::delete_repository(State((*app_state.pool).clone()), path).await
}

// Label handlers
pub async fn get_labels(State(app_state): State<AppState>) -> Result<Json<Vec<Label>>, ApiError> {
    super::label::get_labels(State((*app_state.pool).clone())).await
}

pub async fn get_label(
    State(app_state): State<AppState>,
    path: Path<String>,
) -> Result<Json<Label>, ApiError> {
    super::label::get_label(State((*app_state.pool).clone()), path).await
}

pub async fn create_label(
    State(app_state): State<AppState>,
    Json(create_label): Json<CreateLabel>,
) -> Result<(StatusCode, Json<Label>), ApiError> {
    super::label::create_label(State((*app_state.pool).clone()), Json(create_label)).await
}

pub async fn update_label(
    State(app_state): State<AppState>,
    path: Path<String>,
    Json(update_label): Json<UpdateLabel>,
) -> Result<Json<Label>, ApiError> {
    super::label::update_label(State((*app_state.pool).clone()), path, Json(update_label)).await
}

pub async fn delete_label(
    State(app_state): State<AppState>,
    path: Path<String>,
) -> Result<StatusCode, ApiError> {
    super::label::delete_label(State((*app_state.pool).clone()), path).await
}

// Repository-Label relationship handlers
pub async fn get_repository_labels(
    State(app_state): State<AppState>,
    path: Path<String>,
) -> Result<Json<Vec<Label>>, ApiError> {
    super::repository_label::get_repository_labels(State((*app_state.pool).clone()), path).await
}

pub async fn add_label_to_repository(
    State(app_state): State<AppState>,
    path: Path<String>,
    Json(add_label): Json<AddLabelToRepository>,
) -> Result<StatusCode, ApiError> {
    super::repository_label::add_label_to_repository(
        State((*app_state.pool).clone()),
        path,
        Json(add_label),
    )
    .await
}

pub async fn remove_label_from_repository(
    State(app_state): State<AppState>,
    Path((repo_id, label_id)): Path<(String, String)>,
) -> Result<StatusCode, ApiError> {
    super::repository_label::remove_label_from_repository(
        State((*app_state.pool).clone()),
        Path((repo_id, label_id)),
    )
    .await
}

pub async fn get_repositories_by_label(
    State(app_state): State<AppState>,
    path: Path<String>,
) -> Result<Json<Vec<Repository>>, ApiError> {
    super::repository_label::get_repositories_by_label(State((*app_state.pool).clone()), path).await
}
