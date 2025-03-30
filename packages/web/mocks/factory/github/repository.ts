import type { components } from '@/types/github-api'
import { createUserMock } from './user'

export const createRepositoryMock = (
  partialRepo: Partial<components['schemas']['repository']>
): components['schemas']['repository'] => {
  const id = partialRepo.id || Math.floor(Math.random() * 100000)
  const name = partialRepo.name || `repo-${id}`
  
  const owner = partialRepo.owner 
    ? partialRepo.owner 
    : createUserMock({ login: 'mikinovation' })
  
  const fullName = partialRepo.full_name || `${owner.login}/${name}`
  
  const baseApiUrl = `https://api.github.com/repos/${fullName}`
  const baseGithubUrl = `https://github.com/${fullName}`

  return {
    id,
    node_id: partialRepo.node_id || `MDEwOlJlcG9zaXRvcnkke2lkfQ==`,
    name,
    full_name: fullName,
    owner,
    private: partialRepo.private ?? false,
    html_url: partialRepo.html_url || baseGithubUrl,
    description: partialRepo.description || null,
    fork: partialRepo.fork ?? false,
    url: baseApiUrl,
    archive_url: `${baseApiUrl}/{archive_format}{/ref}`,
    assignees_url: `${baseApiUrl}/assignees{/user}`,
    blobs_url: `${baseApiUrl}/git/blobs{/sha}`,
    branches_url: `${baseApiUrl}/branches{/branch}`,
    collaborators_url: `${baseApiUrl}/collaborators{/collaborator}`,
    comments_url: `${baseApiUrl}/comments{/number}`,
    commits_url: `${baseApiUrl}/commits{/sha}`,
    compare_url: `${baseApiUrl}/compare/{base}...{head}`,
    contents_url: `${baseApiUrl}/contents/{+path}`,
    contributors_url: `${baseApiUrl}/contributors`,
    deployments_url: `${baseApiUrl}/deployments`,
    downloads_url: `${baseApiUrl}/downloads`,
    events_url: `${baseApiUrl}/events`,
    forks_url: `${baseApiUrl}/forks`,
    git_commits_url: `${baseApiUrl}/git/commits{/sha}`,
    git_refs_url: `${baseApiUrl}/git/refs{/sha}`,
    git_tags_url: `${baseApiUrl}/git/tags{/sha}`,
    git_url: `git:github.com/${fullName}.git`,
    issue_comment_url: `${baseApiUrl}/issues/comments{/number}`,
    issue_events_url: `${baseApiUrl}/issues/events{/number}`,
    issues_url: `${baseApiUrl}/issues{/number}`,
    keys_url: `${baseApiUrl}/keys{/key_id}`,
    labels_url: `${baseApiUrl}/labels{/name}`,
    languages_url: `${baseApiUrl}/languages`,
    merges_url: `${baseApiUrl}/merges`,
    milestones_url: `${baseApiUrl}/milestones{/number}`,
    notifications_url: `${baseApiUrl}/notifications{?since,all,participating}`,
    pulls_url: `${baseApiUrl}/pulls{/number}`,
    releases_url: `${baseApiUrl}/releases{/id}`,
    ssh_url: `git@github.com:${fullName}.git`,
    stargazers_url: `${baseApiUrl}/stargazers`,
    statuses_url: `${baseApiUrl}/statuses/{sha}`,
    subscribers_url: `${baseApiUrl}/subscribers`,
    subscription_url: `${baseApiUrl}/subscription`,
    tags_url: `${baseApiUrl}/tags`,
    teams_url: `${baseApiUrl}/teams`,
    trees_url: `${baseApiUrl}/git/trees{/sha}`,
    clone_url: `${baseGithubUrl}.git`,
    hooks_url: `${baseApiUrl}/hooks`,
    svn_url: baseGithubUrl,
    mirror_url: partialRepo.mirror_url ?? null,
    homepage: partialRepo.homepage ?? null,
    language: partialRepo.language ?? null,
    forks_count: partialRepo.forks_count ?? 0,
    stargazers_count: partialRepo.stargazers_count ?? 0,
    watchers_count: partialRepo.watchers_count ?? 0,
    size: partialRepo.size ?? 0,
    default_branch: partialRepo.default_branch || 'main',
    open_issues_count: partialRepo.open_issues_count ?? 0,
    is_template: partialRepo.is_template ?? false,
    topics: partialRepo.topics || [],
    has_issues: partialRepo.has_issues ?? true,
    has_projects: partialRepo.has_projects ?? true,
    has_wiki: partialRepo.has_wiki ?? true,
    has_pages: partialRepo.has_pages ?? false,
    has_downloads: partialRepo.has_downloads ?? true,
    has_discussions: partialRepo.has_discussions ?? false,
    archived: partialRepo.archived ?? false,
    disabled: partialRepo.disabled ?? false,
    visibility: partialRepo.visibility || 'public',
    pushed_at: partialRepo.pushed_at || new Date().toISOString(),
    created_at: partialRepo.created_at || new Date().toISOString(),
    updated_at: partialRepo.updated_at || new Date().toISOString(),
    permissions: partialRepo.permissions || {
      admin: true,
      maintain: true,
      push: true,
      triage: true,
      pull: true
    },
    allow_rebase_merge: partialRepo.allow_rebase_merge ?? true,
    allow_squash_merge: partialRepo.allow_squash_merge ?? true,
    allow_merge_commit: partialRepo.allow_merge_commit ?? true,
    allow_auto_merge: partialRepo.allow_auto_merge ?? false,
    delete_branch_on_merge: partialRepo.delete_branch_on_merge ?? false,
    allow_update_branch: partialRepo.allow_update_branch ?? false,
    use_squash_pr_title_as_default: partialRepo.use_squash_pr_title_as_default ?? false,
    squash_merge_commit_title: partialRepo.squash_merge_commit_title || 'PR_TITLE',
    squash_merge_commit_message: partialRepo.squash_merge_commit_message || 'PR_BODY',
    merge_commit_title: partialRepo.merge_commit_title || 'MERGE_MESSAGE',
    merge_commit_message: partialRepo.merge_commit_message || 'PR_BODY',
    allow_forking: partialRepo.allow_forking ?? true,
    web_commit_signoff_required: partialRepo.web_commit_signoff_required ?? false,
    license: partialRepo.license ?? null,
    forks: partialRepo.forks ?? 0,
    open_issues: partialRepo.open_issues ?? 0,
    watchers: partialRepo.watchers ?? 0,
  }
}

export const createRepositoryMocks = (
  count: number,
  baseProperties?: Partial<components['schemas']['repository']>
): components['schemas']['repository'][] => {
  return Array.from({ length: count }, (_, i) => {
    return createRepositoryMock({
      ...baseProperties,
      id: (baseProperties?.id || 1000) + i,
      name: `${baseProperties?.name || 'repo'}-${i + 1}`,
      updated_at: new Date(Date.now() - i * 86400000).toISOString(), // 1日ずつ古くする
    });
  });
}
