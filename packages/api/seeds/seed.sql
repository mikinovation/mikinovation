-- Clean up existing data
TRUNCATE TABLE todo;
TRUNCATE TABLE repository;

-- Seed data for todos
INSERT INTO todo (id, title, completed, created_at, updated_at) VALUES
('00000000-0000-4000-a000-000000000001', 'Build the frontend', true, NOW(), NOW()),
('00000000-0000-4000-a000-000000000002', 'Create API endpoints', true, NOW(), NOW()),
('00000000-0000-4000-a000-000000000003', 'Design database schema', true, NOW(), NOW()),
('00000000-0000-4000-a000-000000000004', 'Implement authentication', false, NOW(), NOW()),
('00000000-0000-4000-a000-000000000005', 'Write documentation', false, NOW(), NOW());

-- Seed data for repositories
INSERT INTO repository (id, github_id, name, full_name, description, language, html_url, stargazers_count, connected_at, created_at, updated_at) VALUES
('00000000-0000-4000-b000-000000000001', 123456789, 'mikinovation', 'mikinovation/mikinovation', 'Personal portfolio and projects', 'TypeScript', 'https://github.com/mikinovation/mikinovation', 25, NOW(), NOW(), NOW()),
('00000000-0000-4000-b000-000000000002', 234567890, 'rust-api-example', 'mikinovation/rust-api-example', 'Example Rust API using Axum and SQLx', 'Rust', 'https://github.com/mikinovation/rust-api-example', 42, NOW(), NOW(), NOW()),
('00000000-0000-4000-b000-000000000003', 345678901, 'vue-ts-starter', 'mikinovation/vue-ts-starter', 'Vue.js TypeScript starter template', 'Vue', 'https://github.com/mikinovation/vue-ts-starter', 18, NOW(), NOW(), NOW()),
('00000000-0000-4000-b000-000000000004', 456789012, 'docker-compose-setup', 'mikinovation/docker-compose-setup', 'Docker Compose configuration for development', 'Dockerfile', 'https://github.com/mikinovation/docker-compose-setup', 10, NOW(), NOW(), NOW());