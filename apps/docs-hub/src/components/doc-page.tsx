import type { ReactNode } from 'react'

import { SiteLink } from '@/components/site-link'
import type { BadgeTone, Doc, DocAttribute, DocBadge } from '@/lib/docs'

type Crumb = {
  label: string
  href?: string
}

export function Badge({
  tone = 'plain',
  children,
}: {
  tone?: BadgeTone
  children: ReactNode
}) {
  const className = tone === 'plain' ? 'badge' : `badge badge-${tone}`

  return <span className={className}>{children}</span>
}

export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  return (
    <nav className="label flex items-center gap-2">
      {trail.map((crumb, index) => (
        <span key={crumb.label} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden="true">/</span>}
          {crumb.href === undefined ? (
            <span className="text-ink-dim">{crumb.label}</span>
          ) : (
            <SiteLink
              href={crumb.href}
              className="transition-colors hover:text-neon-soft"
            >
              {crumb.label}
            </SiteLink>
          )}
        </span>
      ))}
    </nav>
  )
}

export function Hero({
  trail,
  title,
  lead,
  badges,
  note,
  compact = false,
}: {
  trail: Crumb[]
  title: string
  lead?: ReactNode
  badges?: ReactNode
  note?: string
  compact?: boolean
}) {
  const size = compact ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'

  return (
    <section className="flex flex-col gap-5">
      <Breadcrumb trail={trail} />
      <h1
        className={`${size} leading-tight font-semibold tracking-tight text-balance`}
      >
        <span className="bg-gradient-to-r from-neon-soft via-ink to-flux bg-clip-text text-transparent">
          {title}
        </span>
      </h1>
      {lead !== undefined && <p className="max-w-2xl text-ink-dim">{lead}</p>}
      {badges !== undefined && (
        <div className="flex flex-wrap items-center gap-2">{badges}</div>
      )}
      {note !== undefined && (
        <p className="max-w-2xl text-sm text-ink-faint">{note}</p>
      )}
    </section>
  )
}

export function DocBadges({
  badge,
  attributes,
}: {
  badge: DocBadge | null
  attributes: DocAttribute[]
}) {
  return (
    <>
      {badge !== null && <Badge tone={badge.tone}>{badge.text}</Badge>}
      {attributes.map((attribute) => (
        <Badge key={attribute.label}>
          <span className="text-ink-faint">{attribute.label}</span>
          {attribute.value}
        </Badge>
      ))}
    </>
  )
}

export function CardGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>
}

export function DocCard({
  label,
  number,
  title,
  note,
  footer,
  badge = null,
  href,
}: {
  label: string
  number?: string
  title: string
  note?: string
  footer?: string
  badge?: DocBadge | null
  href: string
}) {
  const body = (
    <>
      <div className="flex items-center gap-2.5">
        <span className="label text-neon-soft">{label}</span>
        {number !== undefined && (
          <span className="font-mono text-xs text-ink-faint">{number}</span>
        )}
      </div>
      <p className="mt-1.5 leading-snug font-medium text-ink">{title}</p>
      {note !== undefined && (
        <p className="mt-2 text-sm text-ink-dim">{note}</p>
      )}
      {footer !== undefined && (
        <p className="mt-3 font-mono text-xs text-ink-faint">{footer}</p>
      )}
      {badge !== null && (
        <div className="mt-3">
          <Badge tone={badge.tone}>{badge.text}</Badge>
        </div>
      )}
    </>
  )

  return (
    <SiteLink href={href} className="doc-card">
      {body}
    </SiteLink>
  )
}

export function DocPager({
  previous,
  next,
}: {
  previous: Doc | null
  next: Doc | null
}) {
  return (
    <nav className="flex flex-col gap-3 sm:flex-row sm:justify-between">
      {previous === null ? (
        <span />
      ) : (
        <SiteLink href={previous.href} className="nav-link">
          <span>← {previous.heading}</span>
        </SiteLink>
      )}
      {next !== null && (
        <SiteLink href={next.href} className="nav-link sm:text-right">
          <span>{next.heading} →</span>
        </SiteLink>
      )}
    </nav>
  )
}
