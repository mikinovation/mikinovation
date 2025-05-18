# @mikinovation/api

## PostgreSQL Configuration

This API uses PostgreSQL as its database.

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgres://postgres:postgres@localhost:5432/mikinovation`)
- `PORT`: API server port number (default: 3000)

### Development Environment Setup

1. Start PostgreSQL using Docker:

```bash
cd packages/api
docker-compose up -d
```

2. Run database migrations:

```bash
cd packages/api
cargo sqlx migrate run
```

3. Start the API server:

```bash
make dev
# or
cd packages/api
cargo run
```

## Testing

To run tests:

```bash
make test-api
# or
cd packages/api
cargo test
```

## API Endpoints

### General
- `GET /api/health`: Check server status

### Todo Management
- `GET /api/todos`: Get all todos
- `POST /api/todos`: Create a new todo
- `GET /api/todos/{id}`: Get a specific todo by ID
- `PUT /api/todos/{id}`: Update a specific todo
- `DELETE /api/todos/{id}`: Delete a specific todo

### Repository Management
- `GET /api/repositories`: Get all repositories
- `POST /api/repositories`: Create a new repository
- `GET /api/repositories/{id}`: Get a specific repository by ID
- `PUT /api/repositories/{id}`: Update a specific repository
- `DELETE /api/repositories/{id}`: Delete a specific repository

### Label Management
- `GET /api/labels`: Get all labels
- `POST /api/labels`: Create a new label
- `GET /api/labels/{id}`: Get a specific label by ID
- `PUT /api/labels/{id}`: Update a specific label
- `DELETE /api/labels/{id}`: Delete a specific label

### Repository-Label Relationships
- `GET /api/repositories/{id}/labels`: Get all labels for a specific repository
- `POST /api/repositories/{id}/labels`: Add a label to a repository
- `DELETE /api/repositories/{id}/labels/{label_id}`: Remove a label from a repository
- `GET /api/labels/{id}/repositories`: Get all repositories with a specific label
