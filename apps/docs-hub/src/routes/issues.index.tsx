import { createFileRoute } from '@tanstack/react-router'

import { Section } from '@/components/doc'
import { Badge, Hero } from '@/components/doc-page'
import { SiteLink } from '@/components/site-link'
import { hasGrilling } from '@/lib/grillings'
import type { Issue, IssueStatus } from '@/lib/issues-schema'

import {
  countIssues,
  issueRepositoryLabel,
  issueStatusLabels,
  issueStatusOrder,
  issueStatusTones,
  listIssues,
} from '@/lib/issues'

export const Route = createFileRoute('/issues/')({
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

const issueLinkClassName =
  'text-neon-soft underline decoration-neon/45 decoration-1 underline-offset-[0.25em] transition-colors hover:text-white hover:decoration-neon'

function IssueRow({ issue }: { issue: Issue }) {
  const href = hasGrilling(issue.id) ? `/issues/${issue.id}` : null

  return (
    <li className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-b-0">
      <span className="font-mono text-xs text-ink-faint">
        {href === null ? (
          issue.id
        ) : (
          <SiteLink href={href} className={issueLinkClassName}>
            {issue.id}
          </SiteLink>
        )}
      </span>
      <span className="min-w-0 flex-1 text-ink-dim">
        {href === null ? (
          issue.title
        ) : (
          <SiteLink href={href} className={issueLinkClassName}>
            {issue.title}
          </SiteLink>
        )}
      </span>
      <span className="font-mono text-xs text-ink-faint">
        {issueRepositoryLabel(issue.repository)}
      </span>
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
        lead="所有者のリポジトリの issue を状態ごとに並べている。正本は src/content/issues.yaml で、1件はタイトル、状態、属するリポジトリを持つ。同じ状態の中では、上にあるものから先に進める。"
        badges={
          <>
            {issueStatusOrder.map((status) => (
              <Badge key={status} tone={issueStatusTones[status]}>
                {issueStatusLabels[status]} {listIssues(status).length}
              </Badge>
            ))}
            <Badge>{countIssues()} issues</Badge>
          </>
        }
        note="承認待ちは、所有者が承認するまで着手しない。該当する issue がない状態は、見出しを出さない。承認済みの issue のうち、論点を出したものは id とタイトルがリンクになる。"
      />

      {issueStatusOrder.map((status) => (
        <IssueList key={status} status={status} />
      ))}
    </div>
  )
}
