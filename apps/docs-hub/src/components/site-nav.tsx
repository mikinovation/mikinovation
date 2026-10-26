import type { NavSection } from '@/components/nav-sections'
import { NavSections } from '@/components/nav-sections'
import { docKindLabels, docKinds, listDocs } from '@/lib/docs'

const sections: NavSection[] = docKinds.map((kind) => ({
  kind,
  label: docKindLabels[kind],
  items: listDocs(kind).map((doc) => ({
    href: doc.href,
    number: doc.number,
    title: doc.title,
  })),
}))

export function SiteNav() {
  return (
    <aside className="sticky top-24 hidden h-fit w-64 shrink-0 lg:block">
      <nav className="flex max-h-[calc(100vh-10rem)] flex-col gap-2 overflow-y-auto pr-1">
        <NavSections sections={sections} />
      </nav>
    </aside>
  )
}
