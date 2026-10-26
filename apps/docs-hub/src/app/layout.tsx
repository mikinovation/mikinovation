import type { Metadata } from 'next'

import { SiteHeader } from '@/components/site-header'
import { SiteNav } from '@/components/site-nav'

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
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <div className="app-backdrop" aria-hidden="true" />

        <SiteHeader />

        <div className="mx-auto flex max-w-7xl gap-10 px-5 py-10">
          <SiteNav />

          <main className="min-w-0 flex-1">{children}</main>
        </div>

        <footer className="mx-auto max-w-7xl px-5 pb-12">
          <hr className="hairline" />
          <p className="label mt-5">src/content/ の TSX が正本</p>
        </footer>
      </body>
    </html>
  )
}
