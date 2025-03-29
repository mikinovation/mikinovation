import createClient from 'openapi-fetch';
import type { paths, operations } from '~/types/github-api';

export const githubClient = createClient<paths>({
  baseUrl: 'https://api.github.com',
});

export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  return headers;
};

export async function fetchUserRepositories(
  username: string,
  token?: string,
  options: operations['repos/list-for-user']['parameters']['query'] = {}
) {
  const { data, error } = await githubClient.GET('/users/{username}/repos', {
    params: {
      path: { username },
      query: {
        sort: 'updated',
        direction: 'desc',
        per_page: 30,
        ...options
      }
    },
    headers: getAuthHeaders(token)
  });

  if (error) {
    console.error('GitHub API Error:', error);
    throw new Error(`Failed to fetch repositories`);
  }

  return data;
}
