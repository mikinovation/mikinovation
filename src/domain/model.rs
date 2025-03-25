use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TodoId(pub Uuid);

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TodoTitle(pub String);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Completed(pub bool);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Todo {
    pub id: TodoId,
    pub title: TodoTitle,
    pub completed: Completed,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl TodoTitle {
    pub fn create(title: String) -> Result<Self, String> {
        if title.trim().is_empty() {
            return Err("Title cannot be empty".to_string());
        }
        if title.len() > 100 {
            return Err("Title is too long (max 100 characters)".to_string());
        }
        Ok(Self(title))
    }
}

pub fn validate_title(title: String) -> Result<TodoTitle, String> {
    TodoTitle::create(title)
}

#[derive(Debug, Clone)]
pub struct CreateTodoInput {
    pub title: TodoTitle,
}

#[derive(Debug, Clone)]
pub struct UpdateTodoInput {
    pub id: TodoId,
    pub title: Option<TodoTitle>,
    pub completed: Option<Completed>,
}

#[derive(Debug, Clone)]
pub enum TodoOutput {
    Created(Todo),
    Updated(Todo),
    Deleted(TodoId),
    Found(Todo),
    NotFound(TodoId),
    List(Vec<Todo>),
}

pub fn create_todo(input: CreateTodoInput) -> TodoOutput {
    let now = Utc::now();
    let todo = Todo {
        id: TodoId(Uuid::new_v4()),
        title: input.title,
        completed: Completed(false),
        created_at: now,
        updated_at: now,
    };

    TodoOutput::Created(todo)
}

pub fn update_todo(input: UpdateTodoInput, existing_todo: Option<Todo>) -> TodoOutput {
    match existing_todo {
        Some(todo) => {
            let updated_todo = Todo {
                id: todo.id,
                title: input.title.unwrap_or(todo.title),
                completed: input.completed.unwrap_or(todo.completed),
                created_at: todo.created_at,
                updated_at: Utc::now(),
            };

            TodoOutput::Updated(updated_todo)
        }
        None => TodoOutput::NotFound(input.id),
    }
}

pub fn delete_todo(id: TodoId, existing_todo: Option<Todo>) -> TodoOutput {
    match existing_todo {
        Some(_) => TodoOutput::Deleted(id),
        None => TodoOutput::NotFound(id),
    }
}

pub fn find_todo(id: TodoId, existing_todo: Option<Todo>) -> TodoOutput {
    match existing_todo {
        Some(todo) => TodoOutput::Found(todo),
        None => TodoOutput::NotFound(id),
    }
}

pub fn list_todos(todos: Vec<Todo>) -> TodoOutput {
    TodoOutput::List(todos)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_title_with_valid_title() {
        let valid_title = "Test Todo".to_string();

        let result = validate_title(valid_title.clone());

        assert!(result.is_ok());
        assert_eq!(result.unwrap().0, valid_title);
    }

    #[test]
    fn test_validate_title_with_empty_title() {
        let empty_title = "".to_string();

        let result = validate_title(empty_title);

        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Title cannot be empty".to_string());
    }

    #[test]
    fn test_validate_title_with_whitespace_title() {
        let whitespace_title = "   ".to_string();

        let result = validate_title(whitespace_title);

        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Title cannot be empty".to_string());
    }

    #[test]
    fn test_validate_title_with_too_long_title() {
        let long_title = "a".repeat(101);

        let result = validate_title(long_title);

        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err(),
            "Title is too long (max 100 characters)".to_string()
        );
    }

    #[test]
    fn test_validate_title_with_max_length_title() {
        let max_length_title = "a".repeat(100);

        let result = validate_title(max_length_title.clone());

        assert!(result.is_ok());
        assert_eq!(result.unwrap().0, max_length_title);
    }

    #[test]
    fn test_create_todo_success() {
        let title = validate_title("New Todo".to_string()).unwrap();
        let input = CreateTodoInput { title };

        let output = create_todo(input);

        if let TodoOutput::Created(todo) = output {
            assert_eq!(todo.title.0, "New Todo");
            assert_eq!(todo.completed.0, false);
            assert!(Uuid::parse_str(&todo.id.0.to_string()).is_ok());

            let now = Utc::now();
            assert!((now.timestamp() - todo.created_at.timestamp()).abs() < 2);
            assert!((now.timestamp() - todo.updated_at.timestamp()).abs() < 2);

            assert_eq!(todo.created_at, todo.updated_at);
        } else {
            panic!("Expected TodoOutput::Created, got {:?}", output);
        }
    }

    #[test]
    fn test_update_todo_title_only() {
        let title = validate_title("Original Todo".to_string()).unwrap();
        let input = CreateTodoInput { title };
        let created = match create_todo(input) {
            TodoOutput::Created(todo) => todo,
            _ => panic!("Failed to create test todo"),
        };
        let new_title = validate_title("Updated Todo".to_string()).unwrap();
        let update_input = UpdateTodoInput {
            id: created.id.clone(),
            title: Some(new_title),
            completed: None,
        };

        let output = update_todo(update_input, Some(created.clone()));

        if let TodoOutput::Updated(updated_todo) = output {
            assert_eq!(updated_todo.id, created.id);
            assert_eq!(updated_todo.title.0, "Updated Todo");
            assert_eq!(updated_todo.completed.0, false);
            assert_eq!(updated_todo.created_at, created.created_at);
            assert!(updated_todo.updated_at > created.updated_at);
        } else {
            panic!("Expected TodoOutput::Updated, got {:?}", output);
        }
    }

    #[test]
    fn test_update_todo_completed_only() {
        let title = validate_title("Original Todo".to_string()).unwrap();
        let input = CreateTodoInput { title };
        let created = match create_todo(input) {
            TodoOutput::Created(todo) => todo,
            _ => panic!("Failed to create test todo"),
        };
        let update_input = UpdateTodoInput {
            id: created.id.clone(),
            title: None,
            completed: Some(Completed(true)),
        };

        let output = update_todo(update_input, Some(created.clone()));

        if let TodoOutput::Updated(updated_todo) = output {
            assert_eq!(updated_todo.id, created.id);
            assert_eq!(updated_todo.title.0, created.title.0);
            assert_eq!(updated_todo.completed.0, true);
            assert_eq!(updated_todo.created_at, created.created_at);
            assert!(updated_todo.updated_at > created.updated_at);
        } else {
            panic!("Expected TodoOutput::Updated, got {:?}", output);
        }
    }

    #[test]
    fn test_update_todo_both_title_and_completed() {
        let title = validate_title("Original Todo".to_string()).unwrap();
        let input = CreateTodoInput { title };
        let created = match create_todo(input) {
            TodoOutput::Created(todo) => todo,
            _ => panic!("Failed to create test todo"),
        };
        let new_title = validate_title("Completed Todo".to_string()).unwrap();
        let update_input = UpdateTodoInput {
            id: created.id.clone(),
            title: Some(new_title),
            completed: Some(Completed(true)),
        };

        let output = update_todo(update_input, Some(created.clone()));

        if let TodoOutput::Updated(updated_todo) = output {
            assert_eq!(updated_todo.id, created.id);
            assert_eq!(updated_todo.title.0, "Completed Todo");
            assert_eq!(updated_todo.completed.0, true);
            assert_eq!(updated_todo.created_at, created.created_at);
            assert!(updated_todo.updated_at > created.updated_at);
        } else {
            panic!("Expected TodoOutput::Updated, got {:?}", output);
        }
    }

    #[test]
    fn test_update_todo_not_found() {
        let random_id = TodoId(Uuid::new_v4());
        let update_input = UpdateTodoInput {
            id: random_id.clone(),
            title: Some(validate_title("Will Not Update".to_string()).unwrap()),
            completed: None,
        };

        let output = update_todo(update_input, None);

        if let TodoOutput::NotFound(id) = output {
            assert_eq!(id, random_id);
        } else {
            panic!("Expected TodoOutput::NotFound, got {:?}", output);
        }
    }

    #[test]
    fn test_delete_todo_success() {
        let title = validate_title("Todo To Delete".to_string()).unwrap();
        let input = CreateTodoInput { title };
        let created = match create_todo(input) {
            TodoOutput::Created(todo) => todo,
            _ => panic!("Failed to create test todo"),
        };

        let output = delete_todo(created.id.clone(), Some(created.clone()));

        if let TodoOutput::Deleted(id) = output {
            assert_eq!(id, created.id);
        } else {
            panic!("Expected TodoOutput::Deleted, got {:?}", output);
        }
    }

    #[test]
    fn test_delete_todo_not_found() {
        let random_id = TodoId(Uuid::new_v4());

        let output = delete_todo(random_id.clone(), None);

        if let TodoOutput::NotFound(id) = output {
            assert_eq!(id, random_id);
        } else {
            panic!("Expected TodoOutput::NotFound, got {:?}", output);
        }
    }

    #[test]
    fn test_find_todo_success() {
        let title = validate_title("Todo To Find".to_string()).unwrap();
        let input = CreateTodoInput { title };
        let created = match create_todo(input) {
            TodoOutput::Created(todo) => todo,
            _ => panic!("Failed to create test todo"),
        };

        let output = find_todo(created.id.clone(), Some(created.clone()));

        if let TodoOutput::Found(todo) = output {
            assert_eq!(todo.id, created.id);
            assert_eq!(todo.title.0, created.title.0);
            assert_eq!(todo.completed.0, created.completed.0);
            assert_eq!(todo.created_at, created.created_at);
            assert_eq!(todo.updated_at, created.updated_at);
        } else {
            panic!("Expected TodoOutput::Found, got {:?}", output);
        }
    }

    #[test]
    fn test_find_todo_not_found() {
        let random_id = TodoId(Uuid::new_v4());

        let output = find_todo(random_id.clone(), None);

        if let TodoOutput::NotFound(id) = output {
            assert_eq!(id, random_id);
        } else {
            panic!("Expected TodoOutput::NotFound, got {:?}", output);
        }
    }

    #[test]
    fn test_list_todos_with_multiple_todos() {
        let title1 = validate_title("Todo 1".to_string()).unwrap();
        let title2 = validate_title("Todo 2".to_string()).unwrap();

        let created1 = match create_todo(CreateTodoInput { title: title1 }) {
            TodoOutput::Created(todo) => todo,
            _ => panic!("Failed to create test todo 1"),
        };

        let created2 = match create_todo(CreateTodoInput { title: title2 }) {
            TodoOutput::Created(todo) => todo,
            _ => panic!("Failed to create test todo 2"),
        };

        let todos = vec![created1.clone(), created2.clone()];

        let output = list_todos(todos);

        if let TodoOutput::List(list) = output {
            assert_eq!(list.len(), 2);

            let has_todo1 = list.iter().any(|t| t.id == created1.id);
            let has_todo2 = list.iter().any(|t| t.id == created2.id);

            assert!(has_todo1, "Todo 1 should be in the list");
            assert!(has_todo2, "Todo 2 should be in the list");
        } else {
            panic!("Expected TodoOutput::List, got {:?}", output);
        }
    }

    #[test]
    fn test_list_todos_with_empty_list() {
        let todos = vec![];

        let output = list_todos(todos);

        if let TodoOutput::List(list) = output {
            assert!(list.is_empty());
        } else {
            panic!("Expected TodoOutput::List, got {:?}", output);
        }
    }
}
