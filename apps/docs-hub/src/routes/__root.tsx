import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { NotFound } from '@/components/not-found'
import { SiteHeader } from '@/components/site-header'
import { SiteNav } from '@/components/site-nav'
import appCss from '@/styles/globals.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Docs Hub' },
      {
        name: 'description',
        content:
          'ポートフォリオと PRD、ADR、設計書、学習ノートを公開するサイト',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  notFoundComponent: NotFound,
  component: Outlet,
  shellComponent: RootDocument,
})

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <head>
        <HeadContent />
      </head>
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

        <Scripts />
      </body>
    </html>
  )
}
