import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GithubRepositoryTable from './index.vue'

const mockGithubRepositories = {
  repositories: [],
  total: 0,
  loading: false,
  error: null,
  currentPage: 1,
  hasNextPage: false,
  updateParams: vi.fn(),
  nextPage: vi.fn(),
  prevPage: vi.fn(),
}

vi.mock('@/composables/useGithubRepositories', () => ({
  useGithubRepositories: vi.fn(() => mockGithubRepositories),
}))

describe('GithubRepositoryTable', () => {
  it('should render loading state', () => {
    mockGithubRepositories.loading = true
    const wrapper = mount(GithubRepositoryTable)

    expect(wrapper.find('.loading-state').text()).toBe('Loading repositories...')
  })
})
