import { ref, computed } from 'vue'
import type { components } from '@/types/github-api'
import type { RepositoriesResponse } from '@/server/api/github/repository'

/**
 * Constants
 */
const SORTED_BY = {
  CREATED: 'created',
  UPDATED: 'updated',
  PUSHED: 'pushed',
  FULL_NAME: 'full_name',
} as const

const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const

/**
 * Types
 */
type SortedBy = typeof SORTED_BY[keyof typeof SORTED_BY]

type SortOrder = typeof SORT_ORDER[keyof typeof SORT_ORDER]

type GithubRepositoryParams = {
  page: number
  perPage: number
  sort: SortedBy
  direction: SortOrder
}

export const useGithubRepositories = (initialParams: Partial<GithubRepositoryParams> = {}) => {
  /**
   * Refs
   */
  const params = ref<GithubRepositoryParams>({
    page: initialParams.page || 1,
    perPage: initialParams.perPage || 10,
    sort: initialParams.sort || SORTED_BY.UPDATED,
    direction: initialParams.direction || SORT_ORDER.DESC,
  })

  /**
   * Composables
   */
  const { data, error, status, refresh } = useFetch<RepositoriesResponse>(
    '/api/github/repository',
    {
      method: 'GET',
      params: computed(() => ({
        username: 'mikinovation',
        page: params.value.page,
        per_page: params.value.perPage,
        sort: params.value.sort,
        direction: params.value.direction,
      })),
    },
  )

  /**
   * Computed
   */
  const repositories = computed<components['schemas']['repository'][]>(() =>
    data.value?.repositories || [],
  )

  const loading = computed(() => status.value === 'pending')

  const total = computed(() => data.value?.total || 0)

  const currentPage = computed(() => data.value?.page || 1)

  const itemsPerPage = computed(() => data.value?.perPage || 10)

  const hasNextPage = computed(() => data.value?.hasMore || false)

  /**
   * Methods
   */
  const updateParams = (newParams: Partial<GithubRepositoryParams>) => {
    params.value = {
      ...params.value,
      ...newParams,
    }
  }

  const goToPage = (page: number): void => {
    if (page < 1) return
    updateParams({ page })
  }

  const nextPage = (): void => {
    if (hasNextPage.value) {
      goToPage(currentPage.value + 1)
    }
  }

  const prevPage = (): void => {
    if (currentPage.value > 1) {
      goToPage(currentPage.value - 1)
    }
  }

  const changeSort = (sort: SortedBy, direction: SortOrder): void => {
    updateParams({
      sort,
      direction,
      page: 1,
    })
  }

  return {
    repositories,
    total,
    loading,
    error,
    refresh,
    params,
    currentPage,
    itemsPerPage,
    hasNextPage,
    updateParams,
    goToPage,
    nextPage,
    prevPage,
    changeSort,
  }
}
