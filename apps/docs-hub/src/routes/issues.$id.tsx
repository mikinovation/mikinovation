import { createFileRoute, notFound } from '@tanstack/react-router'

import { Item, Prose, Section, Steps, Terms } from '@/components/doc'
import { Badge, Hero } from '@/components/doc-page'
import { NotFound } from '@/components/not-found'
import { SiteLink } from '@/components/site-link'
import { findGrilling } from '@/lib/grillings'
import type { GrillingQuestion } from '@/lib/grillings-schema'
import {
  findIssue,
  issueRepositoryLabel,
  issueStatusLabels,
  issueStatusTones,
} from '@/lib/issues'

export const Route = createFileRoute('/issues/$id')({
  loader: ({ params }) => {
    if (findIssue(params.id) === null || findGrilling(params.id) === null) {
      throw notFound()
    }
  },
  head: ({ params }) => {
    const issue = findIssue(params.id)
    if (issue === null) {
      return {}
    }

    return {
      meta: [
        { title: `issue ${issue.id} の論点 | Docs Hub` },
        { name: 'description', content: issue.title },
      ],
    }
  },
  component: GrillingPage,
})

function QuestionSection({
  number,
  question,
}: {
  number: number
  question: GrillingQuestion
}) {
  const terms = [
    { term: '推奨', description: question.recommendation },
    ...(question.rationale === undefined
      ? []
      : [{ term: '根拠', description: question.rationale }]),
    ...(question.followUp === undefined
      ? []
      : [{ term: '次に決めること', description: question.followUp }]),
    ...(question.decision === undefined
      ? []
      : [{ term: '決定', description: question.decision }]),
  ]

  return (
    <Section
      label={`Q${number}`}
      title={question.title}
      aside={
        question.decision === undefined ? undefined : (
          <Badge tone="accepted">決定済み</Badge>
        )
      }
    >
      <div className="panel doc-body flex flex-col gap-5 px-5 py-6">
        <Prose>{question.question}</Prose>
        <Steps>
          {question.options.map((option) => (
            <Item key={option}>{option}</Item>
          ))}
        </Steps>
        <Terms items={terms} />
      </div>
    </Section>
  )
}

function GrillingPage() {
  const { id } = Route.useParams()
  const issue = findIssue(id)
  const grilling = findGrilling(id)
  if (issue === null || grilling === null) {
    return <NotFound />
  }

  return (
    <article className="flex flex-col gap-12">
      <Hero
        trail={[
          { label: 'Docs Hub', href: '/' },
          { label: 'issue', href: '/issues' },
          { label: issue.id },
        ]}
        title={issue.title}
        compact
        lead="この issue に着手する前に決めることを、候補と推奨案の形で並べている。決めるのは所有者で、推奨案は AI が調べた範囲での案である。"
        badges={
          <>
            <Badge tone={issueStatusTones[issue.status]}>
              {issueStatusLabels[issue.status]}
            </Badge>
            <Badge>{issueRepositoryLabel(issue.repository)}</Badge>
            <Badge>
              <span className="text-ink-faint">生成</span>
              {grilling.generatedAt}
            </Badge>
          </>
        }
        note="生成した時点のコードと文書を根拠にしているため、時間が経つと前提がずれる。"
      />

      {grilling.questions.map((question, index) => (
        <QuestionSection
          key={question.id}
          number={index + 1}
          question={question}
        />
      ))}

      <hr className="hairline" />

      <SiteLink href="/issues" className="nav-link">
        <span>← issue 一覧へ戻る</span>
      </SiteLink>
    </article>
  )
}
