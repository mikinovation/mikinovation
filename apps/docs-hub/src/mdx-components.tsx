import type { MDXComponents } from 'mdx/types'
import { isValidElement } from 'react'

import { MermaidDiagram } from '@/components/mermaid-diagram'

type CodeProps = {
  className?: string
  children?: React.ReactNode
}

const mermaidSourceOf = (children: React.ReactNode): string | null => {
  if (!isValidElement<CodeProps>(children)) {
    return null
  }

  const { className, children: code } = children.props
  if (className?.includes('language-mermaid') !== true) {
    return null
  }

  return typeof code === 'string' ? code.trimEnd() : null
}

const components: MDXComponents = {
  pre: ({ children, ...props }) => {
    const source = mermaidSourceOf(children)
    if (source !== null) {
      return <MermaidDiagram source={source} />
    }

    return <pre {...props}>{children}</pre>
  },
}

export function useMDXComponents(): MDXComponents {
  return components
}
