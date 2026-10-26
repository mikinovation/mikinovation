import Link from 'next/link'
import type { ReactNode } from 'react'

import { docRefHref } from '@/lib/docs'

type Field = {
  label: string
  value: ReactNode
}

export function Section({
  label,
  title,
  rule = false,
  children,
}: {
  label?: string
  title: string
  rule?: boolean
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        {label !== undefined && <p className="label">{label}</p>}
        <h2 className={rule ? 'doc-h2' : 'text-xl font-semibold'}>{title}</h2>
      </div>
      {children}
    </section>
  )
}

export function DocSection({
  label,
  title,
  children,
}: {
  label?: string
  title: string
  children: ReactNode
}) {
  return (
    <Section label={label} title={title} rule>
      {children}
    </Section>
  )
}

export function DocSub({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {children}
    </section>
  )
}

export function DocPart({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h4 className="font-semibold text-ink">{title}</h4>
      {children}
    </section>
  )
}

export function Prose({ children }: { children: ReactNode }) {
  return <p>{children}</p>
}

export function Bullets({ children }: { children: ReactNode }) {
  return <ul className="doc-list">{children}</ul>
}

export function Steps({ children }: { children: ReactNode }) {
  return <ol className="doc-steps">{children}</ol>
}

export function Item({
  label,
  children,
}: {
  label?: ReactNode
  children: ReactNode
}) {
  return (
    <li>
      {label !== undefined && <span className="doc-item-label">{label}</span>}
      {children}
    </li>
  )
}

export function Code({ children }: { children: ReactNode }) {
  return <code>{children}</code>
}

export function Pre({ children }: { children: string }) {
  return (
    <pre>
      <code>{children}</code>
    </pre>
  )
}

export function DocLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return href.startsWith('/') ? (
    <Link href={href}>{children}</Link>
  ) : (
    <a href={href}>{children}</a>
  )
}

export function DocRef({
  kind,
  number,
  to,
}: {
  kind: string
  number: string
  to?: string
}) {
  const numbers =
    to === undefined
      ? [number]
      : Array.from({ length: Number(to) - Number(number) + 1 }, (_, index) =>
          String(Number(number) + index).padStart(4, '0'),
        )
  const links = numbers.flatMap((value) => {
    const href = docRefHref(kind, value)
    return href === undefined ? [] : [{ value, href }]
  })

  if (links.length === 0) {
    return `${kind} ${number}`
  }

  if (links.length === 1) {
    return <Link href={links[0].href}>{`${kind} ${links[0].value}`}</Link>
  }

  return links.map((entry, index) => (
    <span key={entry.value}>
      {index > 0 && '、'}
      <Link href={entry.href}>
        {index === 0 ? `${kind} ${entry.value}` : entry.value}
      </Link>
    </span>
  ))
}

export function Terms({
  items,
}: {
  items: { term: string; description: ReactNode }[]
}) {
  return (
    <dl className="doc-terms">
      {items.map((item) => (
        <div key={item.term} className="doc-term">
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </div>
      ))}
    </dl>
  )
}

export function DocTable({
  head,
  rows,
}: {
  head: string[]
  rows: ReactNode[][]
}) {
  return (
    <table>
      <thead>
        <tr>
          {head.map((cell, index) => (
            <th key={index} scope="col">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function Requirements({
  items,
}: {
  items: { id: string; demand: ReactNode; fields: Field[] }[]
}) {
  return (
    <ol className="doc-reqs">
      {items.map((item) => (
        <li key={item.id} className="doc-req">
          <span className="doc-req-id">{item.id}</span>
          <div className="doc-req-body">
            <p className="doc-req-demand">{item.demand}</p>
            {item.fields.map((field) => (
              <p key={field.label} className="doc-req-field">
                <span className="doc-req-label">{field.label}</span>
                {field.value}
              </p>
            ))}
          </div>
        </li>
      ))}
    </ol>
  )
}

export function TradeOffs({
  items,
}: {
  items: { id?: string; option: ReactNode; fields: Field[] }[]
}) {
  return (
    <div className="fig-grid fig-grid-wide">
      {items.map((item, index) => (
        <div key={index} className="doc-trade">
          <p className="doc-trade-head">
            {item.id !== undefined && (
              <span className="doc-trade-id">{item.id}</span>
            )}
            {item.option}
          </p>
          {item.fields.map((field) => (
            <p
              key={field.label}
              className={`doc-trade-field doc-trade-${toneOf(field.label)}`}
            >
              <span className="doc-trade-label">{field.label}</span>
              {field.value}
            </p>
          ))}
        </div>
      ))}
    </div>
  )
}

const toneOf = (label: string): string =>
  label === '利点' ? 'pro' : label === '欠点' ? 'con' : 'plain'

export function Alternatives({
  items,
}: {
  items: { option: ReactNode; reason: ReactNode }[]
}) {
  return (
    <div className="fig-grid fig-grid-wide">
      {items.map((item, index) => (
        <div key={index} className="doc-alt">
          <p className="doc-alt-head">{item.option}</p>
          <div className="doc-alt-reason">{item.reason}</div>
        </div>
      ))}
    </div>
  )
}

export function Sources({
  items,
}: {
  items: { text: ReactNode; href?: string }[]
}) {
  return (
    <ul className="doc-sources">
      {items.map((item, index) => (
        <li key={index}>
          {item.href === undefined ? (
            item.text
          ) : (
            <DocLink href={item.href}>{item.text}</DocLink>
          )}
        </li>
      ))}
    </ul>
  )
}
