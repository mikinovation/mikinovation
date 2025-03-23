use serde::{Serialize, Deserialize};

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
    Error(String),
}

pub type TodoWorkflow<I, O> = fn(I) -> O;

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
