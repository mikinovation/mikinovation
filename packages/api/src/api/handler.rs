use axum::{
    body::Bytes,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use sqlx::Pool;
use sqlx::Postgres;
use std::sync::Arc;

use crate::application::dto::todo::ErrorDto;
use crate::application::mapper::{
    create_todo_dto_to_domain, deserialize_create_todo, deserialize_update_todo,
    output_to_response, string_to_todo_id, update_todo_dto_to_domain,
};
use crate::application::workflow::{
    create_todo_workflow, delete_todo_workflow, find_todo_workflow, list_todos_workflow,
    update_todo_workflow,
};
use crate::infrastructure::data_source::DbPool;

pub async fn health_check() -> impl IntoResponse {
    StatusCode::OK
}

pub async fn create_todo(State(pool): State<Arc<DbPool>>, body: Bytes) -> impl IntoResponse {
    let json = String::from_utf8_lossy(&body).to_string();

    let result = async {
        let dto = deserialize_create_todo(&json)?;

        let domain_input = create_todo_dto_to_domain(dto)?;

        let output = create_todo_workflow(&pool, domain_input).await?;

        let response = output_to_response(output)?;

        anyhow::Ok(response)
    };

    match result.await {
        Ok((status, json)) => (status, Json(json)),
        Err(e) => {
            let error = ErrorDto {
                error: e.to_string(),
            };
            (
                StatusCode::BAD_REQUEST,
                Json(serde_json::to_value(error).unwrap()),
            )
        }
    }
}

pub async fn get_todos(State(pool): State<Arc<DbPool>>) -> impl IntoResponse {
    let result = async {
        let output = list_todos_workflow(&pool).await?;

        let response = output_to_response(output)?;

        anyhow::Ok(response)
    };

    match result.await {
        Ok((status, json)) => (status, Json(json)),
        Err(e) => {
            let error = ErrorDto {
                error: e.to_string(),
            };
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::to_value(error).unwrap()),
            )
        }
    }
}

pub async fn get_todo(
    State(pool): State<Arc<DbPool>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let result = async {
        let todo_id = string_to_todo_id(&id)?;

        let output = find_todo_workflow(&pool, todo_id).await?;

        let response = output_to_response(output)?;

        anyhow::Ok(response)
    };

    match result.await {
        Ok((status, json)) => (status, Json(json)),
        Err(e) => {
            let error = ErrorDto {
                error: e.to_string(),
            };
            (
                StatusCode::BAD_REQUEST,
                Json(serde_json::to_value(error).unwrap()),
            )
        }
    }
}

pub async fn update_todo(
    State(pool): State<Arc<DbPool>>,
    Path(id): Path<String>,
    body: Bytes,
) -> impl IntoResponse {
    let json = String::from_utf8_lossy(&body).to_string();

    let result = async {
        let dto = deserialize_update_todo(&json)?;

        let domain_input = update_todo_dto_to_domain(&id, dto)?;

        let output = update_todo_workflow(&pool, domain_input).await?;

        let response = output_to_response(output)?;

        anyhow::Ok(response)
    };

    match result.await {
        Ok((status, json)) => (status, Json(json)),
        Err(e) => {
            let error = ErrorDto {
                error: e.to_string(),
            };
            (
                StatusCode::BAD_REQUEST,
                Json(serde_json::to_value(error).unwrap()),
            )
        }
    }
}

pub async fn delete_todo(
    State(pool): State<Arc<DbPool>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let result = async {
        let todo_id = string_to_todo_id(&id)?;

        let output = delete_todo_workflow(&pool, todo_id).await?;

        let response = output_to_response(output)?;

        anyhow::Ok(response)
    };

    match result.await {
        Ok((status, json)) => (status, Json(json)),
        Err(e) => {
            let error = ErrorDto {
                error: e.to_string(),
            };
            (
                StatusCode::BAD_REQUEST,
                Json(serde_json::to_value(error).unwrap()),
            )
        }
    }
}
