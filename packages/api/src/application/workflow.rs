use anyhow::Result;
use sqlx::Pool;
use sqlx::Postgres;
use std::sync::Arc;

use crate::domain::todo::{
    create_todo, delete_todo, find_todo, list_todos, update_todo, CreateTodoInput, TodoId,
    TodoOutput, UpdateTodoInput,
};
use crate::infrastructure::data_source::{
    todo::{delete_todo_by_id, find_all_todos, find_todo_by_id, save_todo},
    DataAccessError, DbPool,
};

pub async fn create_todo_workflow(
    pool: &Arc<DbPool>,
    input: CreateTodoInput,
) -> Result<TodoOutput, DataAccessError> {
    let output = create_todo(input);

    if let TodoOutput::Created(todo) = &output {
        save_todo(pool, todo).await?;
    }

    Ok(output)
}

pub async fn update_todo_workflow(
    pool: &Arc<DbPool>,
    input: UpdateTodoInput,
) -> Result<TodoOutput, DataAccessError> {
    let existing_todo = find_todo_by_id(pool, &input.id).await?;

    let output = update_todo(input, existing_todo);

    if let TodoOutput::Updated(todo) = &output {
        save_todo(pool, todo).await?;
    }

    Ok(output)
}

pub async fn delete_todo_workflow(
    pool: &Arc<DbPool>,
    id: TodoId,
) -> Result<TodoOutput, DataAccessError> {
    let existing_todo = find_todo_by_id(pool, &id).await?;

    let output = delete_todo(id.clone(), existing_todo);

    if let TodoOutput::Deleted(id) = &output {
        delete_todo_by_id(pool, id).await?;
    }

    Ok(output)
}

pub async fn find_todo_workflow(
    pool: &Arc<DbPool>,
    id: TodoId,
) -> Result<TodoOutput, DataAccessError> {
    let existing_todo = find_todo_by_id(pool, &id).await?;

    let output = find_todo(id, existing_todo);

    Ok(output)
}

pub async fn list_todos_workflow(pool: &Arc<DbPool>) -> Result<TodoOutput, DataAccessError> {
    let todos = find_all_todos(pool).await?;

    let output = list_todos(todos);

    Ok(output)
}
