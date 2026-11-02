import Link from 'next/link'
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
  return href.startsWith('/') ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  )
}
