import { useRouterState } from '@tanstack/react-router'
import { useState } from 'react'

import { SiteLink } from '@/components/site-link'

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

const pageItems: NavItem[] = [
  { href: '/career', number: 'CV', title: '経歴' },
  { href: '/repositories', number: 'REPO', title: 'リポジトリ' },
  { href: '/review', number: 'REV', title: '見直し' },
  { href: '/issues', number: 'ISS', title: 'issue' },
]

function NavDocLink({ item }: { item: NavItem }) {
  return (
    <SiteLink href={item.href} className="nav-doc">
      <span className="nav-doc-number">{item.number}</span>
      <span className="truncate">{item.title}</span>
    </SiteLink>
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
  onToggle,
}: {
  section: NavSection
  open: boolean
  holdsCurrent: boolean
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
          <NavDocLink key={item.href} item={item} />
        ))}
      </div>
    </div>
  )
}

export function NavSections({ sections }: { sections: NavSection[] }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
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
      {pageItems.map((item) => (
        <NavDocLink key={item.href} item={item} />
      ))}

      {sections.map((section) => (
        <NavGroup
          key={section.kind}
          section={section}
          open={isOpen(section)}
          holdsCurrent={holdsCurrent(section)}
          onToggle={() => toggle(section)}
        />
      ))}
    </>
  )
}
