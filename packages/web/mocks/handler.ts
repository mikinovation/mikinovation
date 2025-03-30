

// packages/web/mocks/handlers.ts
import { http, HttpResponse } from 'msw'
import type { components } from '@/types/github-api'

// Sample repository data
const mockRepositories: components['schemas']['repository'][] = [
  {
    id: 1,
    name: 'mock-repo-1',
    full_name: 'mikinovation/mock-repo-1',
    html_url: 'https://github.com/mikinovation/mock-repo-1',
    description: 'Mock repository for testing',
    fork: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-15T00:00:00Z',
    pushed_at: '2024-03-15T00:00:00Z',
    language: 'TypeScript',
    archived: false,
    disabled: false,
    visibility: 'public',
    owner: {
      login: 'mikinovation',
      id: 1,
      avatar_url: 'https://github.com/mikinovation.png',
      url: 'https://api.github.com/users/mikinovation',
      html_url: 'https://github.com/mikinovation',
      type: 'User',
    },
    private: false,
    stargazers_count: 42,
    watchers_count: 42
  },
  {
    id: 2,
    name: 'mock-repo-2',
    full_name: 'mikinovation/mock-repo-2',
    html_url: 'https://github.com/mikinovation/mock-repo-2',
    description: 'Another mock repository',
    fork: true,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-03-10T00:00:00Z',
    pushed_at: '2024-03-10T00:00:00Z',
    language: 'Rust',
    archived: false,
    disabled: false,
    visibility: 'public',
    owner: {
      login: 'mikinovation',
      id: 1,
      avatar_url: 'https://github.com/mikinovation.png',
      url: 'https://api.github.com/users/mikinovation',
      html_url: 'https://github.com/mikinovation',
      type: 'User',
    },
    private: false,
    stargazers_count: 10,
    watchers_count: 10
  },
  {
    id: 3,
    name: 'mock-repo-3',
    full_name: 'mikinovation/mock-repo-3',
    html_url: 'https://github.com/mikinovation/mock-repo-3',
    description: 'A third mock repository with a longer description to test how it looks in the UI',
    fork: false,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-30T00:00:00Z',
    pushed_at: '2024-03-30T00:00:00Z',
    language: 'Vue',
    archived: true,
    disabled: false,
    visibility: 'public',
    owner: {
      login: 'mikinovation',
      id: 1,
      avatar_url: 'https://github.com/mikinovation.png',
      url: 'https://api.github.com/users/mikinovation',
      html_url: 'https://github.com/mikinovation',
      type: 'User',
    },
    private: false,
    stargazers_count: 25,
    watchers_count: 25
  }
]

// Function to generate paginated repositories based on query parameters
const getPaginatedRepositories = (
  page: number = 1, 
  perPage: number = 10,
  sort: string = 'updated',
  direction: string = 'desc'
) => {
  // Clone the array to avoid mutating the original
  let repos = [...mockRepositories]
  
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
  
  // Calculate pagination
  const start = (page - 1) * perPage
  const paginatedRepos = repos.slice(start, start + perPage)
  
  return {
    repositories: paginatedRepos,
    total: mockRepositories.length,
    page,
    perPage,
    hasMore: start + perPage < mockRepositories.length
  }
}

// Handlers for MSW
export const handlers = [
  // Handler for GitHub repositories endpoint
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
