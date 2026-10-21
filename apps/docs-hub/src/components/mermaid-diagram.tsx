'use client'

import { useEffect, useId, useState } from 'react'

type Props = {
  source: string
}

export function MermaidDiagram({ source }: Props) {
  const [svg, setSvg] = useState<string | null>(null)
  const rawId = useId()

  useEffect(() => {
    let alive = true

    const render = async () => {
      const { default: mermaid } = await import('mermaid')
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        darkMode: true,
        fontFamily: 'var(--font-sans)',
        themeVariables: {
          background: '#080b14',
          primaryColor: '#141a2a',
          primaryBorderColor: '#3ae3ff',
          primaryTextColor: '#e8ecfa',
          lineColor: '#2a3449',
          secondaryColor: '#1c2335',
          tertiaryColor: '#0d111d',
        },
      })
      const rendered = await mermaid.render(
        `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`,
        source,
      )
      if (alive) {
        setSvg(rendered.svg)
      }
    }

    void render()

    return () => {
      alive = false
    }
  }, [rawId, source])

  if (svg === null) {
    return <pre>{source}</pre>
  }

  return (
    <div className="mermaid-figure" dangerouslySetInnerHTML={{ __html: svg }} />
  )
}
