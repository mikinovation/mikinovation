use sqlx::{Pool, Sqlite};
use anyhow::Result;

use crate::domain::model::{
    TodoId, CreateTodoInput, UpdateTodoInput, TodoOutput,
    create_todo, update_todo, delete_todo, find_todo, list_todos
};
use crate::infrastructure::data_access::{
    find_todo_by_id, find_all_todos, save_todo, delete_todo_by_id, DataAccessError
};

pub async fn create_todo_workflow(
    pool: &Pool<Sqlite>, 
    input: CreateTodoInput
) -> Result<TodoOutput, DataAccessError> {
    let output = create_todo(input);
    
    match &output {
        TodoOutput::Created(todo) => {
            save_todo(pool, todo).await?;
        },
        _ => {},
    }
    
    Ok(output)
}

pub async fn update_todo_workflow(
    pool: &Pool<Sqlite>, 
    input: UpdateTodoInput
) -> Result<TodoOutput, DataAccessError> {
    let existing_todo = find_todo_by_id(pool, &input.id).await?;
    
    let output = update_todo(input, existing_todo);
    
    match &output {
        TodoOutput::Updated(todo) => {
            save_todo(pool, todo).await?;
        },
        _ => {},
    }
    
    Ok(output)
}

pub async fn delete_todo_workflow(
    pool: &Pool<Sqlite>, 
    id: TodoId
) -> Result<TodoOutput, DataAccessError> {
    let existing_todo = find_todo_by_id(pool, &id).await?;
    
    let output = delete_todo(id.clone(), existing_todo);
    
    match &output {
        TodoOutput::Deleted(id) => {
            delete_todo_by_id(pool, id).await?;
        },
        _ => {},
    }
    
    Ok(output)
}

pub async fn find_todo_workflow(
    pool: &Pool<Sqlite>, 
    id: TodoId
) -> Result<TodoOutput, DataAccessError> {
    let existing_todo = find_todo_by_id(pool, &id).await?;
    
    let output = find_todo(id, existing_todo);
    
    Ok(output)
}

pub async fn list_todos_workflow(
    pool: &Pool<Sqlite>
) -> Result<TodoOutput, DataAccessError> {
    let todos = find_all_todos(pool).await?;
    
    let output = list_todos(todos);
    
    Ok(output)
}
