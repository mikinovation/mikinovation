use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::Utc;
use sqlx::PgPool;

use crate::error::ApiError;
use crate::models::{CreateLabel, Label, UpdateLabel};

// Get all labels
pub async fn get_labels(State(pool): State<PgPool>) -> Result<Json<Vec<Label>>, ApiError> {
    let labels = sqlx::query_as!(
        Label,
        r#"
        SELECT id, name, description, color, created_at, updated_at
        FROM label
        ORDER BY name ASC
        "#
    )
    .fetch_all(&pool)
    .await
    .map_err(ApiError::DbError)?;

    Ok(Json(labels))
}

// Get a single label by ID
pub async fn get_label(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
) -> Result<Json<Label>, ApiError> {
    let label = sqlx::query_as!(
        Label,
        r#"
        SELECT id, name, description, color, created_at, updated_at
        FROM label
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(&pool)
    .await
    .map_err(ApiError::DbError)?
    .ok_or(ApiError::NotFound)?;

    Ok(Json(label))
}

// Create a new label
pub async fn create_label(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateLabel>,
) -> Result<(StatusCode, Json<Label>), ApiError> {
    if payload.name.trim().is_empty() {
        return Err(ApiError::BadRequest("Label name cannot be empty".into()));
    }

    // Check if label with this name already exists
    let existing = sqlx::query!(
        r#"
        SELECT id FROM label
        WHERE name = $1
        "#,
        payload.name
    )
    .fetch_optional(&pool)
    .await
    .map_err(ApiError::DbError)?;

    if existing.is_some() {
        return Err(ApiError::BadRequest(format!(
            "Label with name '{}' already exists",
            payload.name
        )));
    }

    let label = Label::new(payload);

    sqlx::query!(
        r#"
        INSERT INTO label (
            id, name, description, color, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        "#,
        label.id,
        label.name,
        label.description,
        label.color,
        label.created_at,
        label.updated_at
    )
    .execute(&pool)
    .await
    .map_err(ApiError::DbError)?;

    Ok((StatusCode::CREATED, Json(label)))
}

// Update an existing label
pub async fn update_label(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateLabel>,
) -> Result<Json<Label>, ApiError> {
    // First check if the label exists
    let existing = sqlx::query_as!(
        Label,
        r#"
        SELECT id, name, description, color, created_at, updated_at
        FROM label
        WHERE id = $1
        "#,
        id
    )
    .fetch_optional(&pool)
    .await
    .map_err(ApiError::DbError)?
    .ok_or(ApiError::NotFound)?;

    // If name is being updated, check for uniqueness
    if let Some(ref name) = payload.name {
        if name.trim().is_empty() {
            return Err(ApiError::BadRequest("Label name cannot be empty".into()));
        }

        if name != &existing.name {
            let name_exists = sqlx::query!(
                r#"
                SELECT id FROM label
                WHERE name = $1 AND id != $2
                "#,
                name,
                id
            )
            .fetch_optional(&pool)
            .await
            .map_err(ApiError::DbError)?;

            if name_exists.is_some() {
                return Err(ApiError::BadRequest(format!(
                    "Label with name '{}' already exists",
                    name
                )));
            }
        }
    }

    // Apply updates
    let name = payload.name.unwrap_or(existing.name);
    let description = payload.description.or(existing.description);
    let color = payload.color.or(existing.color);
    let updated_at = Utc::now();

    // Update the label in the database
    let updated = sqlx::query_as!(
        Label,
        r#"
        UPDATE label
        SET name = $1, description = $2, color = $3, updated_at = $4
        WHERE id = $5
        RETURNING id, name, description, color, created_at, updated_at
        "#,
        name,
        description,
        color,
        updated_at,
        id
    )
    .fetch_one(&pool)
    .await
    .map_err(ApiError::DbError)?;

    Ok(Json(updated))
}

// Delete a label
pub async fn delete_label(
    State(pool): State<PgPool>,
    Path(id): Path<String>,
) -> Result<StatusCode, ApiError> {
    let result = sqlx::query!(
        r#"
        DELETE FROM label
        WHERE id = $1
        "#,
        id
    )
    .execute(&pool)
    .await
    .map_err(ApiError::DbError)?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound);
    }

    Ok(StatusCode::NO_CONTENT)
}