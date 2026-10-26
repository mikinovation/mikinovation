import Link from 'next/link'
import type { ReactNode } from 'react'

import type { Doc, DocAttribute } from '@/lib/docs'

type Crumb = {
  label: string
  href?: string
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
            <Link
              href={crumb.href}
              className="transition-colors hover:text-neon-soft"
            >
              {crumb.label}
            </Link>
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

export function Attributes({ attributes }: { attributes: DocAttribute[] }) {
  return (
    <>
      {attributes.map((attribute) => (
        <span key={attribute.label} className="badge">
          <span className="text-ink-faint">{attribute.label}</span>
          {attribute.value}
        </span>
      ))}
    </>
  )
}

export function DocCard({
  label,
  number,
  title,
  note,
  badge,
  href,
}: {
  label: string
  number?: string
  title: string
  note?: string
  badge?: ReactNode
  href: string
}) {
  return (
    <Link href={href} className="doc-card">
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
      {badge !== undefined && <div className="mt-3">{badge}</div>}
    </Link>
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
        <Link href={previous.href} className="nav-link">
          <span>← {previous.heading}</span>
        </Link>
      )}
      {next !== null && (
        <Link href={next.href} className="nav-link sm:text-right">
          <span>{next.heading} →</span>
        </Link>
      )}
    </nav>
  )
}
