use chrono::Utc;
use mikinovation_api::domain::repository::{
    GithubId, Repository, RepositoryDescription, RepositoryFullName, RepositoryId,
    RepositoryLanguage, RepositoryName, RepositoryUrl, StargazersCount,
};
use mikinovation_api::infrastructure::data_source::{init_db_pool, DbPool};
use mikinovation_api::infrastructure::data_source::repository::{
    find_repository_by_id, save_repository, delete_repository_by_id, 
    find_all_repositories, find_repository_by_github_id,
};
use std::env;
use std::sync::Arc;
use uuid::Uuid;

async fn setup_test_db() -> Arc<DbPool> {
    // Set a test database URL
    env::set_var(
        "DATABASE_URL",
        "postgres://postgres:postgres@localhost:5432/mikinovation_test",
    );

    // Get the database URL
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/mikinovation_test".to_string());

    // Initialize the database pool
    let db_pool = init_db_pool(&database_url).await.expect("Failed to initialize database pool");
    
    // Ensure tables exist (run migrations)
    sqlx::query("
        CREATE TABLE IF NOT EXISTS repository (
            id TEXT PRIMARY KEY,
            github_id BIGINT NOT NULL,
            name TEXT NOT NULL,
            full_name TEXT NOT NULL,
            description TEXT,
            language TEXT,
            html_url TEXT NOT NULL,
            stargazers_count BIGINT NOT NULL DEFAULT 0,
            connected_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL
        )
    ")
    .execute(db_pool.as_ref())
    .await
    .expect("Failed to create repository table");
    
    Arc::new(db_pool)
}

async fn cleanup_test_db(db_pool: &Arc<DbPool>) {
    // Clean up the test database
    sqlx::query("DELETE FROM repository")
        .execute(db_pool.as_ref())
        .await
        .expect("Failed to clean up test database");
}

#[tokio::test]
async fn test_repository_crud_operations() {
    // Setup
    let db_pool = setup_test_db().await;
    cleanup_test_db(&db_pool).await;
    
    // Create a test repository
    let repo_id = RepositoryId(Uuid::new_v4());
    let github_id = 12345;
    let now = Utc::now();
    let repository = Repository {
        id: repo_id.clone(),
        github_id: GithubId(github_id),
        name: RepositoryName("test-repo".to_string()),
        full_name: RepositoryFullName("user/test-repo".to_string()),
        description: RepositoryDescription(Some("A test repository".to_string())),
        language: RepositoryLanguage(Some("Rust".to_string())),
        html_url: RepositoryUrl("https://github.com/user/test-repo".to_string()),
        stargazers_count: StargazersCount(42),
        connected_at: now,
        created_at: now,
        updated_at: now,
    };
    
    // Test save_repository (Create)
    save_repository(&db_pool, &repository).await.expect("Failed to save repository");
    
    // Test find_repository_by_id (Read)
    let found_repo = find_repository_by_id(&db_pool, &repo_id).await.expect("Failed to find repository");
    assert!(found_repo.is_some(), "Repository was not found");
    let found_repo = found_repo.unwrap();
    assert_eq!(found_repo.id.0, repository.id.0, "Repository ID does not match");
    assert_eq!(found_repo.name.0, repository.name.0, "Repository name does not match");
    
    // Test find_repository_by_github_id
    let found_by_github_id = find_repository_by_github_id(&db_pool, github_id).await.expect("Failed to find repository by GitHub ID");
    assert!(found_by_github_id.is_some(), "Repository was not found by GitHub ID");
    
    // Test find_all_repositories (Read All)
    let all_repos = find_all_repositories(&db_pool).await.expect("Failed to find all repositories");
    assert!(!all_repos.is_empty(), "No repositories found");
    
    // Test save_repository for update (Update)
    let mut updated_repo = found_repo.clone();
    updated_repo.name = RepositoryName("updated-test-repo".to_string());
    updated_repo.description = RepositoryDescription(Some("An updated test repository".to_string()));
    updated_repo.stargazers_count = StargazersCount(100);
    updated_repo.updated_at = Utc::now();
    save_repository(&db_pool, &updated_repo).await.expect("Failed to update repository");
    
    // Verify update
    let found_updated_repo = find_repository_by_id(&db_pool, &repo_id).await.expect("Failed to find updated repository");
    assert!(found_updated_repo.is_some(), "Updated repository was not found");
    let found_updated_repo = found_updated_repo.unwrap();
    assert_eq!(found_updated_repo.name.0, "updated-test-repo", "Repository name was not updated");
    assert_eq!(found_updated_repo.stargazers_count.0, 100, "Repository stargazers count was not updated");
    
    // Test delete_repository_by_id (Delete)
    delete_repository_by_id(&db_pool, &repo_id).await.expect("Failed to delete repository");
    
    // Verify deletion
    let found_deleted_repo = find_repository_by_id(&db_pool, &repo_id).await.expect("Failed to check deleted repository");
    assert!(found_deleted_repo.is_none(), "Repository was not deleted");
    
    // Cleanup
    cleanup_test_db(&db_pool).await;
}