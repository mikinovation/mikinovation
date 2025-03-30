import type { components } from '@/types/github-api'

export const createUserMock = (
  partialUser: Partial<components['schemas']['simple-user']>
): components['schemas']['simple-user'] => {
  const login = partialUser.login || 'mikinovation'
  const id = partialUser.id || 1
  const nodeId = partialUser.node_id || `MDQ6VXNlcjE=`
  const apiBaseUrl = `https://api.github.com/users/${login}`
  const htmlBaseUrl = `https://github.com/${login}`

  return {
    login,
    id,
    node_id: nodeId,
    name: partialUser.name ?? null,
    email: partialUser.email ?? null,
    avatar_url: partialUser.avatar_url || `${htmlBaseUrl}.png`,
    gravatar_id: partialUser.gravatar_id ?? null,
    url: partialUser.url || apiBaseUrl,
    html_url: partialUser.html_url || htmlBaseUrl,
    followers_url: partialUser.followers_url || `${apiBaseUrl}/followers`,
    following_url: partialUser.following_url || `${apiBaseUrl}/following{/other_user}`,
    gists_url: partialUser.gists_url || `${apiBaseUrl}/gists{/gist_id}`,
    starred_url: partialUser.starred_url || `${apiBaseUrl}/starred{/owner}{/repo}`,
    subscriptions_url: partialUser.subscriptions_url || `${apiBaseUrl}/subscriptions`,
    organizations_url: partialUser.organizations_url || `${apiBaseUrl}/orgs`,
    repos_url: partialUser.repos_url || `${apiBaseUrl}/repos`,
    events_url: partialUser.events_url || `${apiBaseUrl}/events{/privacy}`,
    received_events_url: partialUser.received_events_url || `${apiBaseUrl}/received_events`,
    type: partialUser.type || 'User',
    site_admin: partialUser.site_admin ?? false,
    starred_at: partialUser.starred_at ?? undefined,
    user_view_type: partialUser.user_view_type ?? 'public'
  }
}
