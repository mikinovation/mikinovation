import type { BadgeTone } from '@/lib/docs'
import type { Issue, IssueStatus } from '@/lib/issues-schema'

import issuesFile from '@/content/issues.yaml'
import { parseIssues } from '@/lib/issues-schema'

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

const issues = parseIssues(issuesFile)

export const listIssues = (status: IssueStatus): Issue[] =>
  issues.filter((issue) => issue.status === status)

export const countIssues = (): number => issues.length
