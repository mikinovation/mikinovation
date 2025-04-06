use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RepositoryId(pub Uuid);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct GithubId(pub i64);

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RepositoryName(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RepositoryFullName(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RepositoryDescription(pub Option<String>);

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RepositoryLanguage(pub Option<String>);

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RepositoryUrl(pub String);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct StargazersCount(pub i32);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Repository {
    pub id: RepositoryId,
    pub github_id: GithubId,
    pub name: RepositoryName,
    pub full_name: RepositoryFullName,
    pub description: RepositoryDescription,
    pub language: RepositoryLanguage,
    pub html_url: RepositoryUrl,
    pub stargazers_count: StargazersCount,
    pub connected_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl RepositoryName {
    pub fn create(name: String) -> Result<Self, String> {
        if name.trim().is_empty() {
            return Err("Repository name cannot be empty".to_string());
        }
        if name.len() > 100 {
            return Err("Repository name is too long (max 100 characters)".to_string());
        }
        Ok(Self(name))
    }
}

impl RepositoryFullName {
    pub fn create(full_name: String) -> Result<Self, String> {
        if full_name.trim().is_empty() {
            return Err("Repository full name cannot be empty".to_string());
        }
        if full_name.len() > 200 {
            return Err("Repository full name is too long (max 200 characters)".to_string());
        }
        if !full_name.contains('/') {
            return Err("Repository full name must be in format 'owner/repo'".to_string());
        }
        Ok(Self(full_name))
    }
}

impl RepositoryUrl {
    pub fn create(url: String) -> Result<Self, String> {
        if url.trim().is_empty() {
            return Err("Repository URL cannot be empty".to_string());
        }
        if !url.starts_with("https://") {
            return Err("Repository URL must be a valid HTTPS URL".to_string());
        }
        Ok(Self(url))
    }
}

pub fn validate_repository_name(name: String) -> Result<RepositoryName, String> {
    RepositoryName::create(name)
}

pub fn validate_repository_full_name(full_name: String) -> Result<RepositoryFullName, String> {
    RepositoryFullName::create(full_name)
}

pub fn validate_repository_url(url: String) -> Result<RepositoryUrl, String> {
    RepositoryUrl::create(url)
}

#[derive(Debug, Clone)]
pub struct CreateRepositoryInput {
    pub github_id: GithubId,
    pub name: RepositoryName,
    pub full_name: RepositoryFullName,
    pub description: RepositoryDescription,
    pub language: RepositoryLanguage,
    pub html_url: RepositoryUrl,
    pub stargazers_count: StargazersCount,
}

#[derive(Debug, Clone)]
pub struct UpdateRepositoryInput {
    pub id: RepositoryId,
    pub name: Option<RepositoryName>,
    pub description: Option<RepositoryDescription>,
    pub language: Option<RepositoryLanguage>,
    pub html_url: Option<RepositoryUrl>,
    pub stargazers_count: Option<StargazersCount>,
}

#[derive(Debug, Clone)]
pub enum RepositoryOutput {
    Created(Repository),
    Updated(Repository),
    Deleted(RepositoryId),
    Found(Repository),
    NotFound(RepositoryId),
    List(Vec<Repository>),
}

pub fn create_repository(input: CreateRepositoryInput) -> RepositoryOutput {
    let now = Utc::now();
    let repository = Repository {
        id: RepositoryId(Uuid::new_v4()),
        github_id: input.github_id,
        name: input.name,
        full_name: input.full_name,
        description: input.description,
        language: input.language,
        html_url: input.html_url,
        stargazers_count: input.stargazers_count,
        connected_at: now,
        created_at: now,
        updated_at: now,
    };

    RepositoryOutput::Created(repository)
}

pub fn update_repository(input: UpdateRepositoryInput, existing_repository: Option<Repository>) -> RepositoryOutput {
    match existing_repository {
        Some(repository) => {
            let updated_repository = Repository {
                id: repository.id,
                github_id: repository.github_id,
                name: input.name.unwrap_or(repository.name),
                full_name: repository.full_name,
                description: input.description.unwrap_or(repository.description),
                language: input.language.unwrap_or(repository.language),
                html_url: input.html_url.unwrap_or(repository.html_url),
                stargazers_count: input.stargazers_count.unwrap_or(repository.stargazers_count),
                connected_at: repository.connected_at,
                created_at: repository.created_at,
                updated_at: Utc::now(),
            };

            RepositoryOutput::Updated(updated_repository)
        }
        None => RepositoryOutput::NotFound(input.id),
    }
}

pub fn delete_repository(id: RepositoryId, existing_repository: Option<Repository>) -> RepositoryOutput {
    match existing_repository {
        Some(_) => RepositoryOutput::Deleted(id),
        None => RepositoryOutput::NotFound(id),
    }
}

pub fn find_repository(id: RepositoryId, existing_repository: Option<Repository>) -> RepositoryOutput {
    match existing_repository {
        Some(repository) => RepositoryOutput::Found(repository),
        None => RepositoryOutput::NotFound(id),
    }
}

pub fn list_repositories(repositories: Vec<Repository>) -> RepositoryOutput {
    RepositoryOutput::List(repositories)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_repository_name_with_valid_name() {
        let valid_name = "test-repo".to_string();
        
        let result = validate_repository_name(valid_name.clone());
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap().0, valid_name);
    }
    
    #[test]
    fn test_validate_repository_name_with_empty_name() {
        let empty_name = "".to_string();
        
        let result = validate_repository_name(empty_name);
        
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Repository name cannot be empty".to_string());
    }
    
    #[test]
    fn test_validate_repository_full_name_with_valid_name() {
        let valid_name = "user/repo".to_string();
        
        let result = validate_repository_full_name(valid_name.clone());
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap().0, valid_name);
    }
    
    #[test]
    fn test_validate_repository_full_name_without_slash() {
        let invalid_name = "userrepo".to_string();
        
        let result = validate_repository_full_name(invalid_name);
        
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Repository full name must be in format 'owner/repo'".to_string());
    }
    
    #[test]
    fn test_validate_repository_url_with_valid_url() {
        let valid_url = "https://github.com/user/repo".to_string();
        
        let result = validate_repository_url(valid_url.clone());
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap().0, valid_url);
    }
    
    #[test]
    fn test_validate_repository_url_with_invalid_protocol() {
        let invalid_url = "http://github.com/user/repo".to_string();
        
        let result = validate_repository_url(invalid_url);
        
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Repository URL must be a valid HTTPS URL".to_string());
    }
    
    #[test]
    fn test_create_repository() {
        let name = validate_repository_name("test-repo".to_string()).unwrap();
        let full_name = validate_repository_full_name("user/test-repo".to_string()).unwrap();
        let html_url = validate_repository_url("https://github.com/user/test-repo".to_string()).unwrap();
        
        let input = CreateRepositoryInput {
            github_id: GithubId(123456),
            name,
            full_name,
            description: RepositoryDescription(Some("Test repository".to_string())),
            language: RepositoryLanguage(Some("Rust".to_string())),
            html_url,
            stargazers_count: StargazersCount(42),
        };
        
        let output = create_repository(input);
        
        match output {
            RepositoryOutput::Created(repo) => {
                assert_eq!(repo.github_id.0, 123456);
                assert_eq!(repo.name.0, "test-repo");
                assert_eq!(repo.full_name.0, "user/test-repo");
                assert_eq!(repo.description.0, Some("Test repository".to_string()));
                assert_eq!(repo.language.0, Some("Rust".to_string()));
                assert_eq!(repo.html_url.0, "https://github.com/user/test-repo");
                assert_eq!(repo.stargazers_count.0, 42);
                
                let now = Utc::now();
                assert!((now.timestamp() - repo.created_at.timestamp()).abs() < 2);
                assert!((now.timestamp() - repo.updated_at.timestamp()).abs() < 2);
                assert!((now.timestamp() - repo.connected_at.timestamp()).abs() < 2);
            },
            _ => panic!("Expected RepositoryOutput::Created, got something else"),
        }
    }
    
    #[test]
    fn test_update_repository() {
        let name = validate_repository_name("test-repo".to_string()).unwrap();
        let full_name = validate_repository_full_name("user/test-repo".to_string()).unwrap();
        let html_url = validate_repository_url("https://github.com/user/test-repo".to_string()).unwrap();
        
        let input = CreateRepositoryInput {
            github_id: GithubId(123456),
            name,
            full_name,
            description: RepositoryDescription(Some("Test repository".to_string())),
            language: RepositoryLanguage(Some("Rust".to_string())),
            html_url,
            stargazers_count: StargazersCount(42),
        };
        
        let created = match create_repository(input) {
            RepositoryOutput::Created(repo) => repo,
            _ => panic!("Failed to create test repository"),
        };
        
        // Now update it
        let new_name = validate_repository_name("updated-repo".to_string()).unwrap();
        let new_stars = StargazersCount(100);
        
        let update_input = UpdateRepositoryInput {
            id: created.id.clone(),
            name: Some(new_name),
            description: None,
            language: None,
            html_url: None,
            stargazers_count: Some(new_stars),
        };
        
        let output = update_repository(update_input, Some(created.clone()));
        
        match output {
            RepositoryOutput::Updated(repo) => {
                assert_eq!(repo.id, created.id);
                assert_eq!(repo.github_id, created.github_id);
                assert_eq!(repo.name.0, "updated-repo");
                assert_eq!(repo.full_name, created.full_name);
                assert_eq!(repo.description, created.description);
                assert_eq!(repo.language, created.language);
                assert_eq!(repo.html_url, created.html_url);
                assert_eq!(repo.stargazers_count.0, 100);
                assert_eq!(repo.connected_at, created.connected_at);
                assert_eq!(repo.created_at, created.created_at);
                assert!(repo.updated_at > created.updated_at);
            },
            _ => panic!("Expected RepositoryOutput::Updated, got something else"),
        }
    }
    
    #[test]
    fn test_update_repository_not_found() {
        let random_id = RepositoryId(Uuid::new_v4());
        let update_input = UpdateRepositoryInput {
            id: random_id.clone(),
            name: None,
            description: None,
            language: None,
            html_url: None,
            stargazers_count: None,
        };
        
        let output = update_repository(update_input, None);
        
        match output {
            RepositoryOutput::NotFound(id) => {
                assert_eq!(id, random_id);
            },
            _ => panic!("Expected RepositoryOutput::NotFound, got something else"),
        }
    }
    
    #[test]
    fn test_delete_repository() {
        let name = validate_repository_name("test-repo".to_string()).unwrap();
        let full_name = validate_repository_full_name("user/test-repo".to_string()).unwrap();
        let html_url = validate_repository_url("https://github.com/user/test-repo".to_string()).unwrap();
        
        let input = CreateRepositoryInput {
            github_id: GithubId(123456),
            name,
            full_name,
            description: RepositoryDescription(Some("Test repository".to_string())),
            language: RepositoryLanguage(Some("Rust".to_string())),
            html_url,
            stargazers_count: StargazersCount(42),
        };
        
        let created = match create_repository(input) {
            RepositoryOutput::Created(repo) => repo,
            _ => panic!("Failed to create test repository"),
        };
        
        let output = delete_repository(created.id.clone(), Some(created.clone()));
        
        match output {
            RepositoryOutput::Deleted(id) => {
                assert_eq!(id, created.id);
            },
            _ => panic!("Expected RepositoryOutput::Deleted, got something else"),
        }
    }
    
    #[test]
    fn test_delete_repository_not_found() {
        let random_id = RepositoryId(Uuid::new_v4());
        
        let output = delete_repository(random_id.clone(), None);
        
        match output {
            RepositoryOutput::NotFound(id) => {
                assert_eq!(id, random_id);
            },
            _ => panic!("Expected RepositoryOutput::NotFound, got something else"),
        }
    }
    
    #[test]
    fn test_find_repository() {
        let name = validate_repository_name("test-repo".to_string()).unwrap();
        let full_name = validate_repository_full_name("user/test-repo".to_string()).unwrap();
        let html_url = validate_repository_url("https://github.com/user/test-repo".to_string()).unwrap();
        
        let input = CreateRepositoryInput {
            github_id: GithubId(123456),
            name,
            full_name,
            description: RepositoryDescription(Some("Test repository".to_string())),
            language: RepositoryLanguage(Some("Rust".to_string())),
            html_url,
            stargazers_count: StargazersCount(42),
        };
        
        let created = match create_repository(input) {
            RepositoryOutput::Created(repo) => repo,
            _ => panic!("Failed to create test repository"),
        };
        
        let output = find_repository(created.id.clone(), Some(created.clone()));
        
        match output {
            RepositoryOutput::Found(repo) => {
                assert_eq!(repo.id, created.id);
                assert_eq!(repo.github_id, created.github_id);
                assert_eq!(repo.name, created.name);
                assert_eq!(repo.full_name, created.full_name);
                assert_eq!(repo.description, created.description);
                assert_eq!(repo.language, created.language);
                assert_eq!(repo.html_url, created.html_url);
                assert_eq!(repo.stargazers_count, created.stargazers_count);
                assert_eq!(repo.connected_at, created.connected_at);
                assert_eq!(repo.created_at, created.created_at);
                assert_eq!(repo.updated_at, created.updated_at);
            },
            _ => panic!("Expected RepositoryOutput::Found, got something else"),
        }
    }
    
    #[test]
    fn test_find_repository_not_found() {
        let random_id = RepositoryId(Uuid::new_v4());
        
        let output = find_repository(random_id.clone(), None);
        
        match output {
            RepositoryOutput::NotFound(id) => {
                assert_eq!(id, random_id);
            },
            _ => panic!("Expected RepositoryOutput::NotFound, got something else"),
        }
    }
    
    #[test]
    fn test_list_repositories() {
        let name1 = validate_repository_name("test-repo-1".to_string()).unwrap();
        let full_name1 = validate_repository_full_name("user/test-repo-1".to_string()).unwrap();
        let html_url1 = validate_repository_url("https://github.com/user/test-repo-1".to_string()).unwrap();
        
        let input1 = CreateRepositoryInput {
            github_id: GithubId(123456),
            name: name1,
            full_name: full_name1,
            description: RepositoryDescription(Some("Test repository 1".to_string())),
            language: RepositoryLanguage(Some("Rust".to_string())),
            html_url: html_url1,
            stargazers_count: StargazersCount(42),
        };
        
        let name2 = validate_repository_name("test-repo-2".to_string()).unwrap();
        let full_name2 = validate_repository_full_name("user/test-repo-2".to_string()).unwrap();
        let html_url2 = validate_repository_url("https://github.com/user/test-repo-2".to_string()).unwrap();
        
        let input2 = CreateRepositoryInput {
            github_id: GithubId(654321),
            name: name2,
            full_name: full_name2,
            description: RepositoryDescription(Some("Test repository 2".to_string())),
            language: RepositoryLanguage(Some("TypeScript".to_string())),
            html_url: html_url2,
            stargazers_count: StargazersCount(24),
        };
        
        let created1 = match create_repository(input1) {
            RepositoryOutput::Created(repo) => repo,
            _ => panic!("Failed to create test repository 1"),
        };
        
        let created2 = match create_repository(input2) {
            RepositoryOutput::Created(repo) => repo,
            _ => panic!("Failed to create test repository 2"),
        };
        
        let repos = vec![created1.clone(), created2.clone()];
        
        let output = list_repositories(repos);
        
        match output {
            RepositoryOutput::List(list) => {
                assert_eq!(list.len(), 2);
                assert!(list.iter().any(|r| r.id == created1.id));
                assert!(list.iter().any(|r| r.id == created2.id));
            },
            _ => panic!("Expected RepositoryOutput::List, got something else"),
        }
    }
}
