import { createFileRoute } from '@tanstack/react-router'

import { Section } from '@/components/doc'
import { Badge, CardGrid, DocCard, Hero } from '@/components/doc-page'
import { docKindLabels, listAllDocs, listDocsByRepository } from '@/lib/docs'
import { listRepositories } from '@/lib/repositories'

export const Route = createFileRoute('/repositories')({
  head: () => ({
    meta: [
      { title: 'リポジトリ | Docs Hub' },
      {
        name: 'description',
        content: '公開しているリポジトリと、そこで作っている道具の紹介',
      },
    ],
  }),
  component: RepositoriesPage,
})

function RepositoriesPage() {
  const repositories = listRepositories()
  const total = listAllDocs().length

  return (
    <div className="flex flex-col gap-16">
      <Hero
        trail={[{ label: 'Docs Hub', href: '/' }, { label: 'Repositories' }]}
        title="リポジトリ"
        lead="公開しているリポジトリの紹介。自分が毎日使う開発環境と、作業の途中で欲しくなって作った小さな道具が並ぶ。文書はリポジトリごとに書くため、各リポジトリの下にその文書を並べている。"
        badges={
          <>
            <Badge tone="stage">{repositories.length} repos</Badge>
            <Badge tone="stage">{total} docs</Badge>
            <Badge>開発環境</Badge>
            <Badge>Neovim プラグイン</Badge>
          </>
        }
        note="各リポジトリの URL を押すと GitHub へ移動する。導入の手順と設定の項目は各リポジトリの README に置いている。"
      />

      {repositories.map((repository) => {
        const docs = listDocsByRepository(repository.id)

        return (
          <Section
            key={repository.id}
            id={repository.id}
            label={repository.kind}
            title={repository.name}
            aside={`${docs.length} docs`}
          >
            <div className="panel flex flex-col gap-2 px-5 py-4">
              <p className="text-sm text-ink-dim">{repository.summary}</p>
              <p className="font-mono text-xs text-ink-faint">
                {[repository.year, ...repository.stack].join(' · ')}
              </p>
              <a
                href={repository.url}
                className="text-sm text-neon-soft transition-colors hover:text-neon"
              >
                {repository.url}
              </a>
            </div>

            {docs.length === 0 ? (
              <p className="text-sm text-ink-faint">
                このリポジトリの文書はまだ書いていない。
              </p>
            ) : (
              <CardGrid>
                {docs.map((doc) => (
                  <DocCard
                    key={doc.href}
                    label={docKindLabels[doc.kind]}
                    number={doc.number}
                    title={doc.title}
                    badge={doc.badge}
                    href={doc.href}
                  />
                ))}
              </CardGrid>
            )}
          </Section>
        )
      })}
    </div>
  )
}
