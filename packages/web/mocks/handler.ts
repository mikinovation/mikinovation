import { http, HttpResponse } from 'msw'
import { createRepositoryMock, createRepositoryMocks } from './factory/github/repository'
import { createUserMock } from './factory/github/user'
import type { components } from '@/types/github-api'

const owner = createUserMock({
  login: 'mikinovation',
  name: 'Mikihiro Saito',
  id: 12345678,
  avatar_url: 'https://github.com/mikinovation.png',
})

const mockRepositories: components['schemas']['repository'][] = [
  createRepositoryMock({
    id: 1,
    name: 'mock-repo-1',
    description: 'Mock repository for testing',
    language: 'TypeScript',
    topics: ['typescript', 'api', 'mock'],
    stargazers_count: 42,
    watchers_count: 42,
    forks_count: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    pushed_at: '2024-03-15T00:00:00Z',
    owner,
  }),

  createRepositoryMock({
    id: 2,
    name: 'mock-repo-2',
    description: 'Another mock repository',
    language: 'Rust',
    fork: true,
    topics: ['rust', 'backend'],
    stargazers_count: 10,
    watchers_count: 10,
    forks_count: 2,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z',
    pushed_at: '2024-03-10T00:00:00Z',
    owner,
  }),

  createRepositoryMock({
    id: 3,
    name: 'mock-repo-3',
    description: 'A third mock repository with a longer description to test how it looks in the UI. This repository is archived.',
    language: 'Vue',
    topics: ['vue', 'frontend', 'ui'],
    stargazers_count: 25,
    watchers_count: 25,
    forks_count: 3,
    archived: true,
    is_template: true,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-30T00:00:00Z',
    pushed_at: '2024-03-30T00:00:00Z',
    owner,
  }),
]

const additionalRepos = createRepositoryMocks(10, {
  id: 100,
  owner,
  stargazers_count: 5,
  language: 'JavaScript',
})

// Combine all mock repositories
const allRepositories = [...mockRepositories, ...additionalRepos]

// Function to return paginated repositories based on query parameters
const getPaginatedRepositories = (
  page: number = 1,
  perPage: number = 10,
  sort: string = 'updated',
  direction: string = 'desc',
) => {
  // Clone the array to avoid modifying the original
  const repos = [...allRepositories]

  // Sort repositories based on parameters
  switch (sort) {
    case 'created':
      repos.sort((a, b) => {
        const dateA = new Date(a.created_at || '').getTime()
        const dateB = new Date(b.created_at || '').getTime()
        return direction === 'asc' ? dateA - dateB : dateB - dateA
      })
      break
    case 'updated':
      repos.sort((a, b) => {
        const dateA = new Date(a.updated_at || '').getTime()
        const dateB = new Date(b.updated_at || '').getTime()
        return direction === 'asc' ? dateA - dateB : dateB - dateA
      })
      break
    case 'pushed':
      repos.sort((a, b) => {
        const dateA = new Date(a.pushed_at || '').getTime()
        const dateB = new Date(b.pushed_at || '').getTime()
        return direction === 'asc' ? dateA - dateB : dateB - dateA
      })
      break
    case 'full_name':
      repos.sort((a, b) => {
        return direction === 'asc'
          ? a.full_name.localeCompare(b.full_name)
          : b.full_name.localeCompare(a.full_name)
      })
      break
  }

  const start = (page - 1) * perPage
  const paginatedRepos = repos.slice(start, start + perPage)

  return {
    repositories: paginatedRepos,
    total: allRepositories.length,
    page,
    perPage,
    hasMore: start + perPage < allRepositories.length,
  }
}

export const handlers = [
  http.get('/api/github/repository', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const perPage = parseInt(url.searchParams.get('per_page') || '10', 10)
    const sort = url.searchParams.get('sort') || 'updated'
    const direction = url.searchParams.get('direction') || 'desc'

    const response = getPaginatedRepositories(page, perPage, sort, direction)

    return HttpResponse.json(response)
  }),
]
