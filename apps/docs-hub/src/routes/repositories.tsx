import { createFileRoute } from '@tanstack/react-router'

import { Badge, CardGrid, DocCard, Hero } from '@/components/doc-page'

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

type Repository = {
  name: string
  kind: string
  year: string
  summary: string
  stack: string[]
  url: string
}

const repositories: Repository[] = [
  {
    name: 'mikinovation/mikinovation',
    kind: 'Environment',
    year: '2025',
    summary:
      'Nix flakes と Home Manager で、Neovim や zsh を含む開発環境を宣言的に管理するモノレポ。Claude Code に渡すスキルと、このサイトも同じ場所に置いている。',
    stack: ['Nix', 'Home Manager', 'Lua', 'TypeScript'],
    url: 'https://github.com/mikinovation/mikinovation',
  },
  {
    name: 'nvim-gitui',
    kind: 'Neovim Plugin',
    year: '2023',
    summary:
      'Neovim の浮動ウィンドウに gitui を開き、エディタを離れずに Git を扱うプラグイン。',
    stack: ['Lua', 'Neovim', 'gitui'],
    url: 'https://github.com/mikinovation/nvim-gitui',
  },
  {
    name: 'pathtool.nvim',
    kind: 'Neovim Plugin',
    year: '2025',
    summary:
      '編集中のファイルのパスを絶対、相対、プロジェクト相対など7通りの形式で取り出し、クリップボードへ渡すプラグイン。',
    stack: ['Lua', 'Neovim'],
    url: 'https://github.com/mikinovation/pathtool.nvim',
  },
  {
    name: 'localstack-mail-viewer',
    kind: 'Dev Tool',
    year: '2023',
    summary:
      'LocalStack の SES が受け取ったメールを、一覧と本文で読むビューア。ローカルでの送信結果を画面で確かめる。',
    stack: ['TypeScript', 'Next.js', 'SWR'],
    url: 'https://github.com/mikinovation/localstack-mail-viewer',
  },
]

function RepositoriesPage() {
  return (
    <div className="flex flex-col gap-16">
      <Hero
        trail={[{ label: 'Docs Hub', href: '/' }, { label: 'Repositories' }]}
        title="リポジトリ"
        lead="公開しているリポジトリの紹介。自分が毎日使う開発環境と、作業の途中で欲しくなって作った小さな道具が並ぶ。"
        badges={
          <>
            <Badge tone="stage">{repositories.length} repos</Badge>
            <Badge>開発環境</Badge>
            <Badge>Neovim プラグイン</Badge>
          </>
        }
        note="カードを押すと GitHub へ移動する。導入の手順と設定の項目は各リポジトリの README に置いている。"
      />

      <CardGrid>
        {repositories.map((repo) => (
          <DocCard
            key={repo.name}
            label={repo.kind}
            number={repo.year}
            title={repo.name}
            note={repo.summary}
            footer={repo.stack.join(' · ')}
            href={repo.url}
          />
        ))}
      </CardGrid>
    </div>
  )
}
