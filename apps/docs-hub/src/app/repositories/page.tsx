import type { Metadata } from 'next'

import { Hero } from '@/components/doc-page'

export const metadata: Metadata = {
  title: 'リポジトリ | Docs Hub',
  description: '公開しているリポジトリと、そこで作っている道具の紹介',
}

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

function RepoCard({ repo }: { repo: Repository }) {
  return (
    <a href={repo.url} className="doc-card">
      <div className="flex items-center gap-2.5">
        <span className="label text-neon-soft">{repo.kind}</span>
        <span className="font-mono text-xs text-ink-faint">{repo.year}</span>
      </div>
      <p className="mt-1.5 leading-snug font-medium text-ink">{repo.name}</p>
      <p className="mt-2 text-sm text-ink-dim">{repo.summary}</p>
      <p className="mt-3 font-mono text-xs text-ink-faint">
        {repo.stack.join(' · ')}
      </p>
    </a>
  )
}

export default function RepositoriesPage() {
  return (
    <div className="flex flex-col gap-16">
      <Hero
        trail={[{ label: 'Docs Hub', href: '/' }, { label: 'Repositories' }]}
        title="リポジトリ"
        lead="公開しているリポジトリの紹介。自分が毎日使う開発環境と、作業の途中で欲しくなって作った小さな道具が並ぶ。"
        badges={
          <>
            <span className="badge badge-stage">
              {repositories.length} repos
            </span>
            <span className="badge">開発環境</span>
            <span className="badge">Neovim プラグイン</span>
          </>
        }
        note="カードを押すと GitHub へ移動する。導入の手順と設定の項目は各リポジトリの README に置いている。"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {repositories.map((repo) => (
          <RepoCard key={repo.name} repo={repo} />
        ))}
      </div>
    </div>
  )
}
