import type { Metadata } from 'next'
import Link from 'next/link'

import { docKindLabels, docKinds, listDocs } from '@/lib/docs'

import './globals.css'

export const metadata: Metadata = {
  title: 'Docs Hub',
  description: 'ポートフォリオと PRD、ADR、設計書を公開するサイト',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const sections = docKinds.map((kind) => ({
    kind,
    label: docKindLabels[kind],
    docs: listDocs(kind),
  }))

  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <div className="app-backdrop" aria-hidden="true" />

        <header className="sticky top-0 z-20 border-b border-line bg-base-900/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5">
            <Link
              href="/"
              className="flex items-center gap-3 text-ink no-underline"
            >
              <span className="relative flex size-8 items-center justify-center rounded-lg border border-neon/40 bg-neon/10 font-mono text-sm text-neon shadow-glow">
                D
              </span>
              <span className="text-[0.9375rem] font-semibold tracking-wide">
                Docs Hub
              </span>
            </Link>

            <Link
              href="/career"
              className="label transition-colors hover:text-neon-soft"
            >
              Career
            </Link>

            <div className="ml-auto hidden w-72 md:block">
              <button type="button" className="search-field" disabled>
                <span aria-hidden="true">⌕</span>
                <span className="flex-1">文書を検索（未実装）</span>
                <kbd className="kbd">/</kbd>
              </button>
            </div>

            <a
              href="https://github.com/mikinovation/mikinovation"
              className="label transition-colors hover:text-neon-soft"
            >
              GitHub
            </a>
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl gap-10 px-5 py-10">
          <aside className="sticky top-24 hidden h-fit w-64 shrink-0 lg:block">
            <nav className="flex max-h-[calc(100vh-10rem)] flex-col gap-7 overflow-y-auto pr-1">
              <div className="flex flex-col gap-1.5">
                <p className="label px-3">Profile</p>
                <Link href="/career" className="nav-link">
                  <span className="truncate">経歴</span>
                </Link>
              </div>

              {sections.map((section) => (
                <div key={section.kind} className="flex flex-col gap-1.5">
                  <p className="label px-3">
                    {section.label} · {section.docs.length}
                  </p>
                  {section.docs.map((doc) => (
                    <Link
                      key={doc.slug}
                      href={`/${doc.kind}/${doc.slug}`}
                      className="nav-link"
                    >
                      <span className="truncate">{doc.title}</span>
                      <span className="font-mono text-xs text-ink-faint">
                        {doc.number}
                      </span>
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>

        <footer className="mx-auto max-w-7xl px-5 pb-12">
          <hr className="hairline" />
          <p className="label mt-5">src/content/ の MDX が正本</p>
        </footer>
      </body>
    </html>
  )
}
