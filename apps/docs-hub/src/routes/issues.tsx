import { createFileRoute } from '@tanstack/react-router'

import { Section } from '@/components/doc'
import { Badge, Hero } from '@/components/doc-page'
import type { Issue, IssueStatus } from '@/lib/issues-schema'

import {
  countIssues,
  issueStatusLabels,
  issueStatusTones,
  listIssues,
} from '@/lib/issues'
import { issueStatuses } from '@/lib/issues-schema'

export const Route = createFileRoute('/issues')({
  head: () => ({
    meta: [
      { title: 'issue | Docs Hub' },
      {
        name: 'description',
        content: 'このリポジトリの issue を状態ごとに並べた一覧',
      },
    ],
  }),
  component: IssuesPage,
})

function IssueRow({ issue }: { issue: Issue }) {
  return (
    <li className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-b-0">
      <span className="font-mono text-xs text-ink-faint">{issue.id}</span>
      <span className="text-ink-dim">{issue.title}</span>
    </li>
  )
}

function IssueList({ status }: { status: IssueStatus }) {
  const issues = listIssues(status)
  if (issues.length === 0) {
    return null
  }

  return (
    <Section
      id={status}
      title={issueStatusLabels[status]}
      aside={`${issues.length} issues`}
    >
      <ul className="panel">
        {issues.map((issue) => (
          <IssueRow key={issue.id} issue={issue} />
        ))}
      </ul>
    </Section>
  )
}

function IssuesPage() {
  return (
    <div className="flex flex-col gap-16">
      <Hero
        trail={[{ label: 'Docs Hub', href: '/' }, { label: 'issue' }]}
        title="issue"
        compact
        lead="このリポジトリの issue を状態ごとに並べている。正本は src/content/issues.yaml で、タイトルと状態だけを持つ。"
        badges={
          <>
            {issueStatuses.map((status) => (
              <Badge key={status} tone={issueStatusTones[status]}>
                {issueStatusLabels[status]} {listIssues(status).length}
              </Badge>
            ))}
            <Badge>{countIssues()} issues</Badge>
          </>
        }
        note="該当する issue がない状態は、見出しを出さない。"
      />

      {issueStatuses.map((status) => (
        <IssueList key={status} status={status} />
      ))}
    </div>
  )
}
