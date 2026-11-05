import type { BadgeTone } from '@/lib/docs'
import type { Issue, IssueStatus } from '@/lib/issues-schema'

import issuesFile from '@/content/issues.yaml'

export const issueStatusOrder: readonly IssueStatus[] = [
  'doing',
  'todo',
  'done',
]

export const issueStatusLabels: Record<IssueStatus, string> = {
  doing: '着手中',
  todo: '未着手',
  done: '完了',
}

export const issueStatusTones: Record<IssueStatus, BadgeTone> = {
  doing: 'stage',
  todo: 'plain',
  done: 'accepted',
}

export const listIssues = (status: IssueStatus): Issue[] =>
  issuesFile.issues.filter((issue) => issue.status === status)

export const countIssues = (): number => issuesFile.issues.length
