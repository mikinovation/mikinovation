import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'Docs Hub',
  description: 'ポートフォリオと docs/ の文書を公開するサイト',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
