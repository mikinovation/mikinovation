import type { Metadata } from 'next'
import Link from 'next/link'

import './globals.css'

export const metadata: Metadata = {
  title: 'Docs Hub',
  description: 'ポートフォリオと docs/ の文書を公開するサイト',
}

const navSections = [
  {
    label: 'Documents',
    items: [
      { title: 'ADR', href: '#documents', count: 18 },
      { title: 'PRD', href: '#documents', count: 9 },
      { title: '設計書', href: '#documents', count: 1 },
      { title: 'テストケース', href: '#documents', count: 0 },
      { title: '計画', href: '#documents', count: 0 },
    ],
  },
  {
    label: 'Theme',
    items: [
      { title: '文書本文の見本', href: '#sample', count: null },
      { title: '配色', href: '#palette', count: null },
    ],
  },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
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
          <aside className="sticky top-24 hidden h-fit w-56 shrink-0 lg:block">
            <nav className="flex flex-col gap-7">
              {navSections.map((section) => (
                <div key={section.label} className="flex flex-col gap-1.5">
                  <p className="label px-3">{section.label}</p>
                  {section.items.map((item) => (
                    <a key={item.title} href={item.href} className="nav-link">
                      <span>{item.title}</span>
                      {item.count !== null && (
                        <span className="font-mono text-xs text-ink-faint">
                          {item.count}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>

        <footer className="mx-auto max-w-7xl px-5 pb-12">
          <hr className="hairline" />
          <p className="label mt-5">
            docs/ の Markdown が正本 · 表示だけをこのサイトが担う
          </p>
        </footer>
      </body>
    </html>
  )
}
