import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/vue'
import { renderSuspended} from '@nuxt/test-utils/runtime'
import GithubRepositoryTable from './GithubRepositoryTable.vue'
import { createRepositoryMock } from '@/mocks/factory/github/repository'
import { ref } from 'vue'
import { createUserMock } from '@/mocks/factory/github/user'

vi.mock('@/composables/useGetGithubRepositories', () => ({
  useGithubRepositories: () => {
const owner = createUserMock({
  login: 'mikinovation',
  name: 'Mikihiro Saito',
  id: 12345678,
  avatar_url: 'https://github.com/mikinovation.png',
})
    const mockRepositories = [
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
    owner
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
    owner
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
    owner
  }),
    ]

    return {
      repositories: ref(mockRepositories),
      total: ref(2),
      loading: ref(false),
      error: ref(null),
      currentPage: ref(1),
      hasNextPage: ref(false),
      updateParams: vi.fn(),
      nextPage: vi.fn(),
      prevPage: vi.fn(),
      params: ref({})
    }
  }
}))

describe('GithubRepositoryTable', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  it('renders the table with repository data', async () => {
    await renderSuspended(GithubRepositoryTable)
    
    // Check if table headers exist
    expect(screen.getByText('Repository')).toBeTruthy()
    expect(screen.getByText('Description')).toBeTruthy()
    expect(screen.getByText('Language')).toBeTruthy()
    expect(screen.getByText('Stars')).toBeTruthy()
    expect(screen.getByText('Updated')).toBeTruthy()
    
    // Check if repository data is displayed
    expect(screen.getByText('Test Repo 1')).toBeTruthy()
    expect(screen.getByText('Test description 1')).toBeTruthy()
    expect(screen.getByText('TypeScript')).toBeTruthy()
    expect(screen.getByText('10')).toBeTruthy()
    
    // Check if fork badge is displayed
    expect(screen.getByText('Fork')).toBeTruthy()
  })
})
