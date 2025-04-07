use chrono::{DateTime, Utc};
use sqlx::{Pool, Sqlite};

use super::DataAccessError;
use crate::domain::repository::{
    GithubId, Repository, RepositoryDescription, RepositoryFullName, RepositoryId,
    RepositoryLanguage, RepositoryName, RepositoryUrl, StargazersCount,
};

pub struct RepositoryRow {
    pub id: String,
    pub github_id: i64,
    pub name: String,
    pub full_name: String,
    pub description: Option<String>,
    pub language: Option<String>,
    pub html_url: String,
    pub stargazers_count: i64,
    pub connected_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub fn row_to_domain(row: RepositoryRow) -> Result<Repository, DataAccessError> {
    let id = uuid::Uuid::parse_str(&row.id)
        .map_err(|_| DataAccessError::InvalidData(format!("Invalid UUID: {}", row.id)))?;

    let name = RepositoryName(row.name);
    let full_name = RepositoryFullName(row.full_name);
    let html_url = RepositoryUrl(row.html_url);

    Ok(Repository {
        id: RepositoryId(id),
        github_id: GithubId(row.github_id),
        name,
        full_name,
        description: RepositoryDescription(row.description),
        language: RepositoryLanguage(row.language),
        html_url,
        stargazers_count: StargazersCount(row.stargazers_count),
        connected_at: row.connected_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}

pub async fn find_repository_by_id(
    pool: &Pool<Sqlite>,
    id: &RepositoryId,
) -> Result<Option<Repository>, DataAccessError> {
    let id_str = id.0.to_string();

    let row = sqlx::query_as!(
        RepositoryRow,
        r#"
        SELECT 
           id as "id!: String",
           github_id as "github_id!: i32", 
           name as "name!: String",
           full_name as "full_name!: String",
           description,
           language,
           html_url as "html_url!: String",
           stargazers_count,
           connected_at as "connected_at: DateTime<Utc>",
           created_at as "created_at: DateTime<Utc>", 
           updated_at as "updated_at: DateTime<Utc>"
        FROM repository
        WHERE id = ?
        "#,
        id_str
    )
    .fetch_optional(pool)
    .await
    .map_err(|e| DataAccessError::Database(e.to_string()))?;

    match row {
        Some(row) => row_to_domain(row).map(Some),
        None => Ok(None),
    }
}

pub async fn find_repository_by_github_id(
    pool: &Pool<Sqlite>,
    github_id: i32,
) -> Result<Option<Repository>, DataAccessError> {
    let row = sqlx::query_as!(
        RepositoryRow,
        r#"
        SELECT 
           id as "id!: String",
           github_id as "github_id!: i32", 
           name as "name!: String", 
           full_name as "full_name!: String",
           description,
           language,
           html_url as "html_url!: String",
           stargazers_count,
           connected_at as "connected_at: DateTime<Utc>",
           created_at as "created_at: DateTime<Utc>", 
           updated_at as "updated_at: DateTime<Utc>"
        FROM repository
        WHERE github_id = ?
        "#,
        github_id
    )
    .fetch_optional(pool)
    .await
    .map_err(|e| DataAccessError::Database(e.to_string()))?;

    match row {
        Some(row) => row_to_domain(row).map(Some),
        None => Ok(None),
    }
}

pub async fn find_all_repositories(
    pool: &Pool<Sqlite>,
) -> Result<Vec<Repository>, DataAccessError> {
    let rows = sqlx::query_as!(
        RepositoryRow,
        r#"
        SELECT 
           id as "id!: String",
           github_id as "github_id!: i32", 
           name as "name!: String", 
           full_name as "full_name!: String",
           description,
           language,
           html_url as "html_url!: String",
           stargazers_count,
           connected_at as "connected_at: DateTime<Utc>",
           created_at as "created_at: DateTime<Utc>", 
           updated_at as "updated_at: DateTime<Utc>"
        FROM repository
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(pool)
    .await
    .map_err(|e| DataAccessError::Database(e.to_string()))?;

    let mut repositories = Vec::with_capacity(rows.len());
    for row in rows {
        let repository = row_to_domain(row)?;
        repositories.push(repository);
    }

    Ok(repositories)
}

pub async fn save_repository(
    pool: &Pool<Sqlite>,
    repository: &Repository,
) -> Result<(), DataAccessError> {
    let existing = find_repository_by_id(pool, &repository.id).await?;

    if existing.is_none() {
        sqlx::query(
            r#"
            INSERT INTO repository (id, github_id, name, full_name, description, language, html_url, stargazers_count, connected_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(repository.id.0.to_string())
        .bind(repository.github_id.0)
        .bind(&repository.name.0)
        .bind(&repository.full_name.0)
        .bind(&repository.description.0)
        .bind(&repository.language.0)
        .bind(&repository.html_url.0)
        .bind(repository.stargazers_count.0)
        .bind(repository.connected_at)
        .bind(repository.created_at)
        .bind(repository.updated_at)
        .execute(pool)
        .await
        .map_err(|e| DataAccessError::Database(e.to_string()))?;
    } else {
        sqlx::query(
            r#"
            UPDATE repository
            SET name = ?, description = ?, language = ?, html_url = ?, stargazers_count = ?, updated_at = ?
            WHERE id = ?
            "#,
        )
        .bind(&repository.name.0)
        .bind(&repository.description.0)
        .bind(&repository.language.0)
        .bind(&repository.html_url.0)
        .bind(repository.stargazers_count.0)
        .bind(repository.updated_at)
        .bind(repository.id.0.to_string())
        .execute(pool)
        .await
        .map_err(|e| DataAccessError::Database(e.to_string()))?;
    }

    Ok(())
}

pub async fn delete_repository_by_id(
    pool: &Pool<Sqlite>,
    id: &RepositoryId,
) -> Result<(), DataAccessError> {
    let result = sqlx::query(
        r#"
        DELETE FROM repository
        WHERE id = ?
        "#,
    )
    .bind(id.0.to_string())
    .execute(pool)
    .await
    .map_err(|e| DataAccessError::Database(e.to_string()))?;

    if result.rows_affected() == 0 {
        return Err(DataAccessError::NotFound(id.0.to_string()));
    }

    Ok(())
}
