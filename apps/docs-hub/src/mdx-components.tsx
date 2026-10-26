import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import {
  FigArrow,
  FigCard,
  FigChip,
  FigChips,
  FigGrid,
  FigInk,
  FigLabel,
  FigLegend,
  FigNode,
  FigNote,
  FigSvg,
  FigTerm,
  FigTermRow,
  Figure,
} from '@/components/figure'

const components: MDXComponents = {
  a: ({ href, children, ...props }) =>
    href?.startsWith('/') === true ? (
      <Link href={href} {...props}>
        {children}
      </Link>
    ) : (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  Figure,
  FigSvg,
  FigNode,
  FigArrow,
  FigLabel,
  FigNote,
  FigGrid,
  FigCard,
  FigChips,
  FigChip,
  FigLegend,
  FigTerm,
  FigTermRow,
  FigInk,
}

export function useMDXComponents(): MDXComponents {
  return components
}
