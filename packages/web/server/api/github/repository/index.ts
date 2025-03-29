import { defineEventHandler, createError, getQuery } from 'h3'
import { fetchUserRepositories } from '../../../../infrastructure/githubApi'
import type { components } from '@/types/github-api'

export type RepositoriesResponse = {
  repositories: components['schemas']['repository'][];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const username = (query.username as string) || 'mikinovation'
    const page = parseInt(query.page as string || '1', 10)
    const perPage = parseInt(query.per_page as string || '30', 10)
    const sort = query.sort as 'created' | 'updated' | 'pushed' | 'full_name' || 'updated'
    const direction = query.direction as 'asc' | 'desc' || 'desc'
    
    const config = useRuntimeConfig()
    // OPTIMIZE:: fix assert type 
    const token = config.githubApiToken as string
    
    const repositories = await fetchUserRepositories(username, token, {
      page,
      per_page: perPage,
      sort,
      direction
    })
    
    return <RepositoriesResponse>{
      repositories,
      total: repositories.length,
      page,
      perPage,
      hasMore: repositories.length === perPage
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching repositories:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to fetch repositories'
    })
  }
})
