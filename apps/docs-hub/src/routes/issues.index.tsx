import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { Section } from '@/components/doc'
import { Badge, Hero } from '@/components/doc-page'
import { SiteLink } from '@/components/site-link'
import { findGrillingProgress } from '@/lib/grillings'
import { buildIssueApprovalPrompt } from '@/lib/issue-prompt'
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
const issueRowClassName = 'flex min-w-0 flex-1 items-baseline gap-3 py-3 pr-5'

function IssueRow({
  issue,
  selected,
  onToggle,
}: {
  issue: Issue
  selected?: boolean
  onToggle?: (id: string) => void
}) {
  const progress = findGrillingProgress(issue.id)
  const href = progress === null ? null : `/issues/${issue.id}`

  const cells = (
    <>
      <span className="font-mono text-xs text-ink-faint">{issue.id}</span>
      <span
        className={`min-w-0 flex-1 text-ink-dim ${href === null ? '' : 'group-hover:text-ink'}`}
      >
        {issue.title}
      </span>
      {progress !== null && (
        <span className="font-mono text-xs text-ink-faint">
          {progress.decided}/{progress.total}
        </span>
      )}
      <span className="font-mono text-xs text-ink-faint">
        {issueRepositoryLabel(issue.repository)}
      </span>
    </>
  )

  return (
    <li className="flex items-center border-b border-line pl-5 last:border-b-0">
      {onToggle !== undefined && (
        <input
          type="checkbox"
          className="check-box mr-3"
          checked={selected === true}
          onChange={() => onToggle(issue.id)}
          aria-label={`issue ${issue.id} を選ぶ`}
        />
      )}
      {href === null ? (
        <div className={issueRowClassName}>{cells}</div>
      ) : (
        <SiteLink
          href={href}
          className={`group transition-colors hover:bg-neon/6 ${issueRowClassName}`}
        >
          {cells}
        </SiteLink>
      )}
    </li>
  )
}

function IssueList({
  status,
  selectedIds,
  onToggle,
}: {
  status: IssueStatus
  selectedIds: readonly string[]
  onToggle: (id: string) => void
}) {
  const issues = listIssues(status)
  if (issues.length === 0) {
    return null
  }

  const selectable = status === 'proposed'

  return (
    <Section
      id={status}
      title={issueStatusLabels[status]}
      aside={`${issues.length} issues`}
    >
      <ul className="panel">
        {issues.map((issue) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            selected={selectable ? selectedIds.includes(issue.id) : undefined}
            onToggle={selectable ? onToggle : undefined}
          />
        ))}
      </ul>
    </Section>
  )
}

function ActionBar({
  count,
  copied,
  uncopiedPrompt,
  onCopy,
}: {
  count: number
  copied: boolean
  uncopiedPrompt: string | null
  onCopy: () => void
}) {
  return (
    <div className="action-bar">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
        <button type="button" className="action-button" onClick={onCopy}>
          承認のプロンプトをコピー
        </button>
        <p className="text-sm text-ink-faint">
          {count} 件を選んでいる。{copied ? 'コピーした。' : ''}
        </p>
        {uncopiedPrompt !== null && (
          <p className="min-w-0 basis-full text-sm text-ink-faint">
            コピーできなかった。次の文面を手で写してほしい。
            <code className="ml-2 font-mono break-all text-ink">
              {uncopiedPrompt}
            </code>
          </p>
        )}
      </div>
    </div>
  )
}

function IssuesPage() {
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([])
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null)
  const [uncopiedPrompt, setUncopiedPrompt] = useState<string | null>(null)

  const toggle = (id: string) => {
    setCopiedPrompt(null)
    setUncopiedPrompt(null)
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : listIssues('proposed')
            .filter((issue) => issue.id === id || current.includes(issue.id))
            .map((issue) => issue.id),
    )
  }

  const copy = async () => {
    const prompt = buildIssueApprovalPrompt(selectedIds)
    try {
      await navigator.clipboard.writeText(prompt)
      setCopiedPrompt(prompt)
      setUncopiedPrompt(null)
    } catch {
      setCopiedPrompt(null)
      setUncopiedPrompt(prompt)
    }
  }

  return (
    <div
      className={`flex flex-col gap-16 ${selectedIds.length === 0 ? '' : 'pb-24'}`}
    >
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
        note="承認待ちは、所有者が承認するまで着手しない。該当する issue がない状態は、見出しを出さない。承認済みの issue のうち、論点を出したものは行全体がリンクになり、決めた問の数を全体の問数との割合で出す。承認待ちの行を選ぶと、画面の下に出るバーから、状態の更新を頼む文面をコピーできる。"
      />

      {issueStatusOrder.map((status) => (
        <IssueList
          key={status}
          status={status}
          selectedIds={selectedIds}
          onToggle={toggle}
        />
      ))}

      {selectedIds.length > 0 && (
        <ActionBar
          count={selectedIds.length}
          copied={copiedPrompt !== null}
          uncopiedPrompt={uncopiedPrompt}
          onCopy={() => {
            void copy()
          }}
        />
      )}
    </div>
  )
}
