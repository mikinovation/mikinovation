import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

export function SiteLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  if (!href.startsWith('/')) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }

  const [path, hash] = href.split('#')

  return (
    <Link
      to={path}
      hash={hash}
      className={className}
      activeOptions={{ exact: true }}
      activeProps={{}}
    >
      {children}
    </Link>
  )
}
