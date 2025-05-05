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

- `GET /api/health`: Check server status
- `GET /api/todos`: Get all todos
- `POST /api/todos`: Create a new todo
- `GET /api/todos/{id}`: Get a specific todo by ID
- `PUT /api/todos/{id}`: Update a specific todo
- `DELETE /api/todos/{id}`: Delete a specific todo
