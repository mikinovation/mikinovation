import type { BadgeTone } from '@/lib/docs'
import type { Issue, IssueRepository, IssueStatus } from '@/lib/issues-schema'

import issuesFile from '@/content/issues.yaml'

export const issueStatusOrder: readonly IssueStatus[] = [
  'doing',
  'todo',
  'proposed',
  'done',
]

export const issueStatusLabels: Record<IssueStatus, string> = {
  doing: '着手中',
  todo: '未着手',
  proposed: '承認待ち',
  done: '完了',
}

export const issueStatusTones: Record<IssueStatus, BadgeTone> = {
  doing: 'stage',
  todo: 'plain',
  proposed: 'pending',
  done: 'accepted',
}

export const issueRepositoryLabel = (repository: IssueRepository): string =>
  repository === 'common' ? '共通' : repository

export const listIssues = (status: IssueStatus): Issue[] =>
  issuesFile.issues.filter((issue) => issue.status === status)

export const countIssues = (): number => issuesFile.issues.length

export const findIssue = (id: string): Issue | null =>
  issuesFile.issues.find((issue) => issue.id === id) ?? null
