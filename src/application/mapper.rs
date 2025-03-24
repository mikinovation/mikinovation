use anyhow::Result;
use uuid::Uuid;

use crate::domain::model::{
    Todo, TodoId, Completed, 
    CreateTodoInput, UpdateTodoInput, TodoOutput, validate_title
};
use crate::application::dto::{
    JsonString, CreateTodoDto, UpdateTodoDto, 
    TodoDto, TodoListDto, ErrorDto, SuccessDto, SerializationError
};

pub fn deserialize_create_todo(json: &JsonString) -> Result<CreateTodoDto, SerializationError> {
    serde_json::from_str(json)
        .map_err(|e| SerializationError::Deserialize(e.to_string()))
}

pub fn deserialize_update_todo(json: &JsonString) -> Result<UpdateTodoDto, SerializationError> {
    serde_json::from_str(json)
        .map_err(|e| SerializationError::Deserialize(e.to_string()))
}

pub fn create_todo_dto_to_domain(dto: CreateTodoDto) -> Result<CreateTodoInput, SerializationError> {
    let title = validate_title(dto.title)
        .map_err(|e| SerializationError::Validation(e))?;
    
    Ok(CreateTodoInput { title })
}

pub fn update_todo_dto_to_domain(id_str: &str, dto: UpdateTodoDto) -> Result<UpdateTodoInput, SerializationError> {
    let uuid = Uuid::parse_str(id_str)
        .map_err(|_| SerializationError::Validation("Invalid UUID format".to_string()))?;
    
    let title = if let Some(title_str) = dto.title {
        Some(validate_title(title_str)
            .map_err(|e| SerializationError::Validation(e))?)
    } else {
        None
    };
    
    let completed = dto.completed.map(|c| Completed(c));
    
    Ok(UpdateTodoInput {
        id: TodoId(uuid),
        title,
        completed,
    })
}

pub fn string_to_todo_id(id_str: &str) -> Result<TodoId, SerializationError> {
    Uuid::parse_str(id_str)
        .map(TodoId)
        .map_err(|_| SerializationError::Validation("Invalid UUID format".to_string()))
}

pub fn todo_to_dto(todo: &Todo) -> TodoDto {
    TodoDto {
        id: todo.id.0,
        title: todo.title.0.clone(),
        completed: todo.completed.0,
        created_at: todo.created_at,
        updated_at: todo.updated_at,
    }
}

pub fn todos_to_dto(todos: &[Todo]) -> TodoListDto {
    TodoListDto {
        todos: todos.iter().map(todo_to_dto).collect(),
    }
}

pub fn output_to_response(output: TodoOutput) -> Result<(axum::http::StatusCode, serde_json::Value), SerializationError> {
    use axum::http::StatusCode;
    
    match output {
        TodoOutput::Created(todo) => {
            let dto = todo_to_dto(&todo);
            let json = serde_json::to_value(dto)
                .map_err(|e| SerializationError::Serialize(e.to_string()))?;
            Ok((StatusCode::CREATED, json))
        },
        TodoOutput::Updated(todo) | TodoOutput::Found(todo) => {
            let dto = todo_to_dto(&todo);
            let json = serde_json::to_value(dto)
                .map_err(|e| SerializationError::Serialize(e.to_string()))?;
            Ok((StatusCode::OK, json))
        },
        TodoOutput::List(todos) => {
            let dto = todos_to_dto(&todos);
            let json = serde_json::to_value(dto)
                .map_err(|e| SerializationError::Serialize(e.to_string()))?;
            Ok((StatusCode::OK, json))
        },
        TodoOutput::Deleted(id) => {
            let dto = SuccessDto { 
                message: format!("Todo with id {} has been deleted", id.0)
            };
            let json = serde_json::to_value(dto)
                .map_err(|e| SerializationError::Serialize(e.to_string()))?;
            Ok((StatusCode::NO_CONTENT, json))
        },
        TodoOutput::NotFound(id) => {
            let dto = ErrorDto { 
                error: format!("Todo with id {} not found", id.0)
            };
            let json = serde_json::to_value(dto)
                .map_err(|e| SerializationError::Serialize(e.to_string()))?;
            Ok((StatusCode::NOT_FOUND, json))
        },
    }
}
