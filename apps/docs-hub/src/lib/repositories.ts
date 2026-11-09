export const repositoryIds = [
  'mikinovation',
  'nvim-gitui',
  'pathtool-nvim',
  'localstack-mail-viewer',
] as const

export type RepositoryId = (typeof repositoryIds)[number]

export type Repository = {
  id: RepositoryId
  name: string
  kind: string
  year: string
  summary: string
  stack: string[]
  url: string
}

const repositories: Repository[] = [
  {
    id: 'mikinovation',
    name: 'mikinovation/mikinovation',
    kind: 'Environment',
    year: '2025',
    summary:
      'Nix flakes と Home Manager で、Neovim や zsh を含む開発環境を宣言的に管理するモノレポ。Claude Code に渡すスキルと、このサイトも同じ場所に置いている。',
    stack: ['Nix', 'Home Manager', 'Lua', 'TypeScript'],
    url: 'https://github.com/mikinovation/mikinovation',
  },
  {
    id: 'nvim-gitui',
    name: 'nvim-gitui',
    kind: 'Neovim Plugin',
    year: '2023',
    summary:
      'Neovim の浮動ウィンドウに gitui を開き、エディタを離れずに Git を扱うプラグイン。',
    stack: ['Lua', 'Neovim', 'gitui'],
    url: 'https://github.com/mikinovation/nvim-gitui',
  },
  {
    id: 'pathtool-nvim',
    name: 'pathtool.nvim',
    kind: 'Neovim Plugin',
    year: '2025',
    summary:
      '編集中のファイルのパスを絶対、相対、プロジェクト相対など7通りの形式で取り出し、クリップボードへ渡すプラグイン。',
    stack: ['Lua', 'Neovim'],
    url: 'https://github.com/mikinovation/pathtool.nvim',
  },
  {
    id: 'localstack-mail-viewer',
    name: 'localstack-mail-viewer',
    kind: 'Dev Tool',
    year: '2023',
    summary:
      'LocalStack の SES が受け取ったメールを、一覧と本文で読むビューア。ローカルでの送信結果を画面で確かめる。',
    stack: ['TypeScript', 'Next.js', 'SWR'],
    url: 'https://github.com/mikinovation/localstack-mail-viewer',
  },
]

export const listRepositories = (): Repository[] => repositories
