'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export type NavItem = {
  href: string
  number: string
  title: string
}

export type NavSection = {
  kind: string
  label: string
  items: NavItem[]
}

type ToggleState = {
  path: string
  overrides: Record<string, boolean>
}

function NavDocLink({ item, current }: { item: NavItem; current: boolean }) {
  return (
    <Link
      href={item.href}
      className="nav-doc"
      aria-current={current ? 'page' : undefined}
    >
      <span className="nav-doc-number">{item.number}</span>
      <span className="truncate">{item.title}</span>
    </Link>
  )
}

function NavGroupMark() {
  return (
    <svg className="nav-group-mark" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M4 2.5 L8 6 L4 9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NavGroup({
  section,
  open,
  holdsCurrent,
  currentHref,
  onToggle,
}: {
  section: NavSection
  open: boolean
  holdsCurrent: boolean
  currentHref: string
  onToggle: () => void
}) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        className="nav-group"
        aria-expanded={open}
        onClick={onToggle}
      >
        <NavGroupMark />
        <span className="label">{section.label}</span>
        <span className="nav-group-count">{section.items.length}</span>
        {holdsCurrent && !open && (
          <span className="nav-group-dot" aria-hidden="true" />
        )}
      </button>

      <div className="nav-group-body" hidden={!open}>
        {section.items.map((item) => (
          <NavDocLink
            key={item.href}
            item={item}
            current={item.href === currentHref}
          />
        ))}
      </div>
    </div>
  )
}

export function NavSections({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname()
  const [state, setState] = useState<ToggleState>({
    path: pathname,
    overrides: {},
  })

  const overrides = state.path === pathname ? state.overrides : {}

  const holdsCurrent = (section: NavSection) =>
    section.items.some((item) => item.href === pathname)

  const isOpen = (section: NavSection) =>
    overrides[section.kind] ?? holdsCurrent(section)

  const toggle = (section: NavSection) => {
    setState({
      path: pathname,
      overrides: { ...overrides, [section.kind]: !isOpen(section) },
    })
  }

  return (
    <>
      <Link
        href="/career"
        className="nav-doc"
        aria-current={pathname === '/career' ? 'page' : undefined}
      >
        <span className="nav-doc-number">CV</span>
        <span className="truncate">経歴</span>
      </Link>

      <Link
        href="/repositories"
        className="nav-doc"
        aria-current={pathname === '/repositories' ? 'page' : undefined}
      >
        <span className="nav-doc-number">REPO</span>
        <span className="truncate">リポジトリ</span>
      </Link>

      {sections.map((section) => (
        <NavGroup
          key={section.kind}
          section={section}
          open={isOpen(section)}
          holdsCurrent={holdsCurrent(section)}
          currentHref={pathname}
          onToggle={() => toggle(section)}
        />
      ))}
    </>
  )
}
