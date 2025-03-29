import { ref, computed } from 'vue'
import type { components } from '@/types/github-api'
import type { RepositoriesResponse } from '@/server/api/github/repository'

export type GithubRepositoryParams = {
  username?: string;
  page?: number;
  perPage?: number;
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
}

export const useGithubRepositories = (initialParams: GithubRepositoryParams = {}) => {
  const params = ref<GithubRepositoryParams>({
    username: initialParams.username || 'mikinovation',
    page: initialParams.page || 1,
    perPage: initialParams.perPage || 10,
    sort: initialParams.sort || 'updated',
    direction: initialParams.direction || 'desc'
  })
  
  const { data, error, status, refresh } = useFetch<RepositoriesResponse>(
    '/api/github/repository',
    {
      method: 'GET',
      params: computed(() => ({
        username: params.value.username,
        page: params.value.page,
        per_page: params.value.perPage,
        sort: params.value.sort,
        direction: params.value.direction
      })),
    }
  )
  
  const repositories = computed<components['schemas']['repository'][]>(() => 
    data.value?.repositories || []
  )

  const loading = computed(() => status.value === 'pending')
  
  const total = computed(() => data.value?.total || 0)
  
  const currentPage = computed(() => data.value?.page || 1)
  
  const itemsPerPage = computed(() => data.value?.perPage || 10)
  
  const hasNextPage = computed(() => data.value?.hasMore || false)
  
  const updateParams = (newParams: Partial<GithubRepositoryParams>) => {
    params.value = {
      ...params.value,
      ...newParams
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
  
  const prevPage = (): void =>  {
    if (currentPage.value > 1) {
      goToPage(currentPage.value - 1)
    }
  }
  
  const changeSort = (sort: 'created' | 'updated' | 'pushed' | 'full_name', direction?: 'asc' | 'desc') => {
    updateParams({ 
      sort, 
      direction: direction || params.value.direction,
      page: 1
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
    changeSort
  }
}
