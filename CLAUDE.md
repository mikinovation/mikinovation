# CLAUDE.md

## Repository Structure
```
/packages/
  /api/     - Rust backend API
  /web/     - Vue.js web application
  /ui/      - Shared UI components
```

## Development Workflow

### Post-Task Verification

After completing ANY code changes, you MUST run the following verification steps in order:

```bash
make lint && make typecheck-web && make typecheck-ui && make fmt-api && make test-api && make build
```
