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

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::postgres::PgPoolOptions;
    use std::env;

    async fn setup_test_db() -> PgPool {
        let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
            "postgres://postgres:postgres@localhost:5432/mikinovation_test".to_string()
        });

        let pool = PgPoolOptions::new()
            .max_connections(1)
            .connect(&database_url)
            .await
            .expect("Failed to connect to test database");

        pool
    }

    async fn cleanup_labels(pool: &PgPool) {
        sqlx::query("DELETE FROM label")
            .execute(pool)
            .await
            .expect("Failed to clean up label table");
    }

    async fn create_test_label(pool: &PgPool, name: &str) -> Label {
        let create_label = CreateLabel {
            name: name.to_string(),
            description: Some("Test description".to_string()),
            color: Some("#ff0000".to_string()),
        };
        let label = Label::new(create_label);

        sqlx::query!(
            r#"
            INSERT INTO label (id, name, description, color, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            "#,
            label.id,
            label.name,
            label.description,
            label.color,
            label.created_at,
            label.updated_at
        )
        .execute(pool)
        .await
        .expect("Failed to create test label");

        label
    }

    #[tokio::test]
    async fn test_get_labels_empty() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        let state = State(pool.clone());

        let result = get_labels(state).await;
        assert!(result.is_ok());

        let Json(labels) = result.unwrap();
        assert_eq!(labels.len(), 0);
    }

    #[tokio::test]
    async fn test_get_labels_with_data() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        create_test_label(&pool, "Label A").await;
        create_test_label(&pool, "Label B").await;

        let state = State(pool.clone());
        let result = get_labels(state).await;
        assert!(result.is_ok());

        let Json(labels) = result.unwrap();
        assert_eq!(labels.len(), 2);

        assert_eq!(labels[0].name, "Label A");
        assert_eq!(labels[1].name, "Label B");
    }

    #[tokio::test]
    async fn test_get_labels_order() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        create_test_label(&pool, "Zoo").await;
        create_test_label(&pool, "Alpha").await;

        let state = State(pool.clone());
        let result = get_labels(state).await;
        assert!(result.is_ok());

        let Json(labels) = result.unwrap();
        assert_eq!(labels.len(), 2);
        assert_eq!(labels[0].name, "Alpha");
        assert_eq!(labels[1].name, "Zoo");
    }

    #[tokio::test]
    async fn test_get_label_success() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        let test_label = create_test_label(&pool, "Test Label").await;

        let state = State(pool.clone());
        let path = Path(test_label.id.clone());
        let result = get_label(state, path).await;

        assert!(result.is_ok());
        let Json(label) = result.unwrap();
        assert_eq!(label.id, test_label.id);
        assert_eq!(label.name, "Test Label");
        assert_eq!(label.description, Some("Test description".to_string()));
        assert_eq!(label.color, Some("#ff0000".to_string()));
    }

    #[tokio::test]
    async fn test_get_label_not_found() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        let state = State(pool.clone());
        let path = Path("non-existent-id".to_string());
        let result = get_label(state, path).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[tokio::test]
    async fn test_create_label_success() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        let state = State(pool.clone());
        let payload = CreateLabel {
            name: "New Label".to_string(),
            description: Some("New description".to_string()),
            color: Some("#00ff00".to_string()),
        };
        let result = create_label(state, Json(payload)).await;

        assert!(result.is_ok());
        let (status, Json(label)) = result.unwrap();
        assert_eq!(status, StatusCode::CREATED);
        assert_eq!(label.name, "New Label");
        assert_eq!(label.description, Some("New description".to_string()));
        assert_eq!(label.color, Some("#00ff00".to_string()));
        assert!(!label.id.is_empty());

        let saved_label = sqlx::query_as!(
            Label,
            r#"
            SELECT id, name, description, color, created_at, updated_at
            FROM label
            WHERE id = $1
            "#,
            label.id
        )
        .fetch_one(&pool)
        .await
        .expect("Failed to fetch created label");

        assert_eq!(saved_label.name, "New Label");
    }

    #[tokio::test]
    async fn test_create_label_empty_name() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        let state = State(pool.clone());
        let payload = CreateLabel {
            name: "".to_string(),
            description: None,
            color: None,
        };
        let result = create_label(state, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::BadRequest(msg) => assert_eq!(msg, "Label name cannot be empty"),
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_create_label_whitespace_name() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        let state = State(pool.clone());
        let payload = CreateLabel {
            name: "   ".to_string(),
            description: None,
            color: None,
        };
        let result = create_label(state, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::BadRequest(msg) => assert_eq!(msg, "Label name cannot be empty"),
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_create_label_duplicate_name() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        create_test_label(&pool, "Duplicate").await;

        let state = State(pool.clone());
        let payload = CreateLabel {
            name: "Duplicate".to_string(),
            description: None,
            color: None,
        };
        let result = create_label(state, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::BadRequest(msg) => assert_eq!(msg, "Label with name 'Duplicate' already exists"),
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_update_label_name_only() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        let test_label = create_test_label(&pool, "Original Name").await;
        let original_updated_at = test_label.updated_at;

        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

        let state = State(pool.clone());
        let path = Path(test_label.id.clone());
        let payload = UpdateLabel {
            name: Some("Updated Name".to_string()),
            description: None,
            color: None,
        };
        let result = update_label(state, path, Json(payload)).await;

        assert!(result.is_ok());
        let Json(updated_label) = result.unwrap();
        assert_eq!(updated_label.id, test_label.id);
        assert_eq!(updated_label.name, "Updated Name");
        assert_eq!(updated_label.description, test_label.description);
        assert_eq!(updated_label.color, test_label.color);
        assert!(updated_label.updated_at > original_updated_at);
    }

    #[tokio::test]
    async fn test_update_label_all_fields() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        let test_label = create_test_label(&pool, "Original").await;

        let state = State(pool.clone());
        let path = Path(test_label.id.clone());
        let payload = UpdateLabel {
            name: Some("New Name".to_string()),
            description: Some("New description".to_string()),
            color: Some("#0000ff".to_string()),
        };
        let result = update_label(state, path, Json(payload)).await;

        assert!(result.is_ok());
        let Json(updated_label) = result.unwrap();
        assert_eq!(updated_label.id, test_label.id);
        assert_eq!(updated_label.name, "New Name");
        assert_eq!(updated_label.description, Some("New description".to_string()));
        assert_eq!(updated_label.color, Some("#0000ff".to_string()));
    }

    #[tokio::test]
    async fn test_update_label_not_found() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        let state = State(pool.clone());
        let path = Path("non-existent-id".to_string());
        let payload = UpdateLabel {
            name: Some("Updated".to_string()),
            description: None,
            color: None,
        };
        let result = update_label(state, path, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[tokio::test]
    async fn test_update_label_duplicate_name() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        create_test_label(&pool, "Existing Label").await;
        let test_label = create_test_label(&pool, "Test Label").await;

        let state = State(pool.clone());
        let path = Path(test_label.id.clone());
        let payload = UpdateLabel {
            name: Some("Existing Label".to_string()),
            description: None,
            color: None,
        };
        let result = update_label(state, path, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::BadRequest(msg) => assert_eq!(msg, "Label with name 'Existing Label' already exists"),
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_update_label_empty_name() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        let test_label = create_test_label(&pool, "Test Label").await;

        let state = State(pool.clone());
        let path = Path(test_label.id.clone());
        let payload = UpdateLabel {
            name: Some("".to_string()),
            description: None,
            color: None,
        };
        let result = update_label(state, path, Json(payload)).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::BadRequest(msg) => assert_eq!(msg, "Label name cannot be empty"),
            _ => panic!("Expected BadRequest error"),
        }
    }

    #[tokio::test]
    async fn test_delete_label_success() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        let test_label = create_test_label(&pool, "To Be Deleted").await;

        let state = State(pool.clone());
        let path = Path(test_label.id.clone());
        let result = delete_label(state, path).await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap(), StatusCode::NO_CONTENT);

        let deleted_label = sqlx::query_as!(
            Label,
            r#"
            SELECT id, name, description, color, created_at, updated_at
            FROM label
            WHERE id = $1
            "#,
            test_label.id
        )
        .fetch_optional(&pool)
        .await
        .expect("Failed to query deleted label");

        assert!(deleted_label.is_none());
    }

    #[tokio::test]
    async fn test_delete_label_not_found() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        let state = State(pool.clone());
        let path = Path("non-existent-id".to_string());
        let result = delete_label(state, path).await;

        assert!(result.is_err());
        match result.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }

    #[tokio::test]
    async fn test_delete_label_idempotent() {
        let pool = setup_test_db().await;
        cleanup_labels(&pool).await;

        let test_label = create_test_label(&pool, "To Be Deleted").await;
        let state = State(pool.clone());
        let path = Path(test_label.id.clone());

        let result = delete_label(state, path).await;
        assert!(result.is_ok());

        let state2 = State(pool.clone());
        let path2 = Path(test_label.id.clone());
        let result2 = delete_label(state2, path2).await;
        assert!(result2.is_err());
        match result2.unwrap_err() {
            ApiError::NotFound => (),
            _ => panic!("Expected NotFound error"),
        }
    }
}
