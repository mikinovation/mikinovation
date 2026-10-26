import type { ReactNode } from 'react'

type Tone = 'neon' | 'mint' | 'amber' | 'rose' | 'flux' | 'ghost'

type Ink = 'neon' | 'mint' | 'amber' | 'rose' | 'flux' | 'dim'

type Point = [number, number]

type Align = 'center' | 'start' | 'end'

const noStrings: string[] = []

const modifier = (base: string, tone: Tone | Ink | undefined): string =>
  tone === undefined ? base : `${base} ${base}-${tone}`

const alignClass = (align: Align | undefined): string =>
  align === 'start' ? ' fig-start' : align === 'end' ? ' fig-end' : ''

const anchorOf = (
  x: number,
  width: number,
  align: Align | undefined,
  padX: number,
): number =>
  align === 'start'
    ? x + padX
    : align === 'end'
      ? x + width - padX
      : x + width / 2

export function Figure({
  caption,
  children,
}: {
  caption: string
  children: ReactNode
}) {
  return (
    <figure className="doc-figure">
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

export function FigSvg({
  height,
  label,
  width = 760,
  children,
}: {
  height: number
  label: string
  width?: number
  children: ReactNode
}) {
  return (
    <svg className="fig-svg" viewBox={`0 0 ${width} ${height}`}>
      <title>{label}</title>
      {children}
    </svg>
  )
}

export function FigNode({
  x,
  y,
  w,
  h,
  tone,
  tag,
  title,
  lines = noStrings,
  align,
  valign = 'center',
  padX = 16,
  rx = 12,
}: {
  x: number
  y: number
  w: number
  h: number
  tone?: Tone
  tag?: string
  title?: string
  lines?: string[]
  align?: Align
  valign?: 'center' | 'top'
  padX?: number
  rx?: number
}) {
  const rows = [
    ...(title === undefined ? [] : [{ text: title, className: 'fig-title' }]),
    ...lines.map((text) => ({ text, className: 'fig-sub' })),
  ]
  const tagHeight = tag === undefined ? 0 : 26
  const step = 21
  const first =
    valign === 'top'
      ? y + tagHeight + 24
      : y + tagHeight + (h - tagHeight) / 2 - ((rows.length - 1) * step) / 2

  return (
    <>
      <rect
        className={modifier('fig-box', tone)}
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
      />
      {tag !== undefined && (
        <text className="fig-tag" x={x + w / 2} y={y + 18}>
          {tag}
        </text>
      )}
      {rows.map((row, index) => (
        <text
          key={row.text}
          className={`${row.className}${alignClass(align)}`}
          x={anchorOf(x, w, align, padX)}
          y={first + index * step}
        >
          {row.text}
        </text>
      ))}
    </>
  )
}

export function FigArrow({
  points,
  tone,
  head = true,
}: {
  points: Point[]
  tone?: 'neon' | 'soft'
  head?: boolean
}) {
  const path = points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`)
    .join(' ')
  const lineClass = `fig-edge${tone === undefined ? '' : ` fig-edge-${tone}`}`

  const [fromX, fromY] = points[points.length - 2] ?? points[0]
  const [toX, toY] = points[points.length - 1]
  const length = Math.hypot(toX - fromX, toY - fromY) || 1
  const unitX = (toX - fromX) / length
  const unitY = (toY - fromY) / length
  const baseX = toX - unitX * 9
  const baseY = toY - unitY * 9
  const headPath = `M${toX} ${toY} L${baseX - unitY * 4} ${baseY + unitX * 4} L${baseX + unitY * 4} ${baseY - unitX * 4} Z`

  return (
    <>
      <path className={lineClass} d={path} />
      {head && (
        <path
          className={`fig-head${tone === 'neon' ? ' fig-head-neon' : ''}`}
          d={headPath}
        />
      )}
    </>
  )
}

export function FigLabel({
  x,
  y,
  align,
  children,
}: {
  x: number
  y: number
  align?: Align
  children: ReactNode
}) {
  return (
    <text className={`fig-tag${alignClass(align)}`} x={x} y={y}>
      {children}
    </text>
  )
}

export function FigNote({
  x,
  y,
  align,
  children,
}: {
  x: number
  y: number
  align?: Align
  children: ReactNode
}) {
  return (
    <text className={`fig-sub${alignClass(align)}`} x={x} y={y}>
      {children}
    </text>
  )
}

export function FigGrid({
  wide = false,
  children,
}: {
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div className={`fig-grid${wide ? ' fig-grid-wide' : ''}`}>{children}</div>
  )
}

export function FigCard({
  tone,
  title,
  note,
  children,
}: {
  tone?: Tone
  title: string
  note?: string
  children?: ReactNode
}) {
  return (
    <div className={modifier('fig-card', tone)}>
      <span className="fig-card-head">{title}</span>
      {children}
      {note !== undefined && <span className="fig-card-note">{note}</span>}
    </div>
  )
}

export function FigChips({
  tone,
  items = noStrings,
  children,
}: {
  tone?: Tone
  items?: string[]
  children?: ReactNode
}) {
  return (
    <div className="fig-chips">
      {items.map((item) => (
        <span key={item} className={modifier('fig-chip', tone)}>
          {item}
        </span>
      ))}
      {children}
    </div>
  )
}

export function FigChip({
  tone,
  children,
}: {
  tone?: Tone
  children: ReactNode
}) {
  return <span className={modifier('fig-chip', tone)}>{children}</span>
}

export function FigLegend({ items }: { items: { tone: Ink; text: string }[] }) {
  return (
    <div className="fig-legend">
      {items.map((item) => (
        <span key={item.text} className={`fig-legend-key fig-${item.tone}`}>
          <span className="fig-swatch" />
          {item.text}
        </span>
      ))}
    </div>
  )
}

export function FigTerm({ children }: { children: ReactNode }) {
  return <div className="fig-term">{children}</div>
}

export function FigTermRow({ children }: { children: ReactNode }) {
  return <div className="fig-term-row">{children}</div>
}

export function FigInk({ tone, children }: { tone: Ink; children: ReactNode }) {
  return <span className={`fig-${tone}`}>{children}</span>
}
