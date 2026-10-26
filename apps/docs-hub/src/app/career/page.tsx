import type { Metadata } from 'next'
import Link from 'next/link'

import {
  FigArrow,
  FigCard,
  FigChip,
  FigChips,
  FigGrid,
  FigNode,
  FigNote,
  FigSvg,
  Figure,
} from '@/components/figure'

export const metadata: Metadata = {
  title: '経歴 | Docs Hub',
  description:
    'フロントエンドを軸に、設計から運用までを一貫して受けるフリーランスのエンジニアの経歴',
}

const facts = ['屋号 Gerunda', '個人事業主', '2018年開業', 'フロントエンド']

const strengths = [
  {
    title: '設計から運用まで続けて担う',
    note: '仕様の検討、アーキテクチャの設計、実装、テスト、リリース後の運用保守までを1人で追う。画面の裏側で何が起きるかを踏まえて設計できるため、手戻りが減る。',
  },
  {
    title: '古い構成の移行をやり切る',
    note: '動いてはいるが更新が止まった構成を、現行の構成へ移す仕事を多く引き受けてきた。移行後に誰が触っても壊れない形まで持っていく。',
  },
  {
    title: '英語で越境チームと進める',
    note: 'ベトナムの開発チームへの発注と受け入れ、現地エンジニアのタスク管理とコードレビューを英語で担当してきた。フィリピンに住んだ経験がある。',
  },
]

const phases = ['要件定義', '設計', '実装', 'テスト', 'リリースと運用'] as const

const roles = [
  {
    title: 'メンバー',
    note: '仕様に沿ったコンポーネントの設計、実装、単体テスト、結合テスト',
  },
  {
    title: 'フロントエンドのリード',
    note: 'フロント全体の設計とリファクタ方針の策定、コードレビュー、ドキュメントの整備、プロジェクトを横断した知見の共有',
  },
  {
    title: 'PM・ブリッジ SE',
    note: '要件定義、仕様設計、海外のエンジニアへの発注と受け入れ、タスク管理',
  },
  {
    title: 'メンター',
    note: 'プログラミングスクールでの HTML、CSS、JavaScript、React の指導',
  },
]

const migrations = [
  { from: 'Vue 2 / Property Decorator', to: 'Vue 3 / Nuxt 4' },
  { from: 'TypeORM', to: 'Prisma' },
  { from: 'Ts.ED', to: 'NestJS' },
  { from: 'Vuetify', to: 'Tailwind CSS' },
  { from: 'Netlify', to: 'AWS CloudFront' },
]

const works = [
  {
    title: '開発環境の改善',
    items: [
      'CI/CD の構築と運用',
      'テスト戦略の策定と単体テストの整備',
      'Storybook の運用',
      '型の設計とモジュールの責務分離',
    ],
  },
  {
    title: '越境した協業',
    items: [
      '英語での仕様書の作成と受け入れ',
      '現地エンジニアのタスク管理とレビュー',
      '朝会とふりかえりの運営',
    ],
  },
  {
    title: 'AI の活用',
    items: [
      'プロダクトへの AI 機能の追加',
      '組織全体の生産性向上の施策の考案と推進',
      'AI エージェントに渡すスキルとコンテキストの整備',
    ],
  },
]

const stacks = [
  {
    label: 'Languages',
    items: ['JavaScript', 'TypeScript', 'Ruby', 'PHP', 'Java'],
  },
  {
    label: 'Frontend',
    items: ['Vue.js', 'Nuxt', 'React', 'Next.js', 'Angular'],
  },
  {
    label: 'Backend',
    items: ['Ruby on Rails', 'Laravel', 'Spring Boot', 'NestJS', 'Ts.ED'],
  },
  {
    label: 'Database / ORM',
    items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Prisma', 'TypeORM'],
  },
  {
    label: 'Infrastructure',
    items: ['AWS', 'Google Cloud', 'Docker'],
  },
  {
    label: 'Tooling',
    items: [
      'GitHub Actions',
      'CircleCI',
      'Storybook',
      'Elasticsearch',
      'Jira',
      'Backlog',
    ],
  },
]

const domains = [
  'toB 向けの業務システム',
  '脱炭素',
  '教育',
  '物流',
  '人材',
  '公共インフラの管理',
]

export default function CareerPage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col gap-5">
        <nav className="label flex items-center gap-2">
          <Link href="/" className="transition-colors hover:text-neon-soft">
            Docs Hub
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink-dim">Career</span>
        </nav>
        <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-r from-neon-soft via-ink to-flux bg-clip-text text-transparent">
            齋藤 幹大
          </span>
        </h1>
        <p className="max-w-2xl text-ink-dim">
          JavaScript と TypeScript を主な言語に、Vue と React
          でのフロントエンド開発を受けるフリーランスのエンジニア。toB
          向けの業務システムと SaaS
          で、設計から運用保守までを続けて担当している。
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {facts.map((fact) => (
            <span key={fact} className="badge">
              {fact}
            </span>
          ))}
        </div>
        <p className="max-w-2xl text-sm text-ink-faint">
          公開用のページのため、案件ごとの期間、取引先、担当業務の詳細は載せていない。必要な場合は個別に開示する。
        </p>
      </section>

      <section className="flex flex-col gap-5">
        <p className="label">Strengths</p>
        <h2 className="text-xl font-semibold">引き受けられること</h2>
        <FigGrid wide>
          {strengths.map((strength) => (
            <FigCard
              key={strength.title}
              title={strength.title}
              note={strength.note}
            />
          ))}
        </FigGrid>
      </section>

      <section className="flex flex-col gap-5">
        <p className="label">Scope</p>
        <h2 className="text-xl font-semibold">担当する工程</h2>
        <Figure caption="要件定義はレビューと仕様の提案で加わり、設計から運用保守までを主に担う。">
          <FigSvg height={148} label="担当する工程の範囲" width={660}>
            {phases.map((phase, index) => (
              <FigNode
                key={phase}
                x={1 + index * 136}
                y={16}
                w={108}
                h={64}
                tone={index === 0 ? undefined : 'neon'}
                title={phase}
              />
            ))}
            {phases.slice(0, -1).map((phase, index) => (
              <FigArrow
                key={phase}
                points={[
                  [index * 136 + 113, 48],
                  [index * 136 + 133, 48],
                ]}
              />
            ))}
            <path className="fig-axis" d="M137 96 L137 106 L653 106 L653 96" />
            <FigNote x={55} y={100}>
              レビューと提案
            </FigNote>
            <FigNote x={395} y={128}>
              設計から運用まで一貫して担う
            </FigNote>
          </FigSvg>
        </Figure>
      </section>

      <section className="flex flex-col gap-5">
        <p className="label">Roles</p>
        <h2 className="text-xl font-semibold">担ってきた役割</h2>
        <FigGrid wide>
          {roles.map((role) => (
            <FigCard key={role.title} title={role.title} note={role.note} />
          ))}
        </FigGrid>
      </section>

      <section className="flex flex-col gap-5">
        <p className="label">Migrations</p>
        <h2 className="text-xl font-semibold">移行してきた技術基盤</h2>
        <Figure caption="移行はいずれも稼働中のプロダクトで進めた。段階を分けて出し、途中で止まらない形にする。">
          <div className="flex flex-col gap-2.5">
            {migrations.map((migration) => (
              <div
                key={migration.to}
                className="flex flex-wrap items-center gap-2.5"
              >
                <FigChip tone="ghost">{migration.from}</FigChip>
                <span aria-hidden="true" className="text-sm text-ink-faint">
                  →
                </span>
                <FigChip tone="neon">{migration.to}</FigChip>
              </div>
            ))}
          </div>
        </Figure>
      </section>

      <section className="flex flex-col gap-5">
        <p className="label">Practices</p>
        <h2 className="text-xl font-semibold">続けて取り組んでいること</h2>
        <FigGrid wide>
          {works.map((work) => (
            <FigCard key={work.title} title={work.title}>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-ink-dim">
                {work.items.map((item) => (
                  <li key={item} className="marker:text-neon">
                    {item}
                  </li>
                ))}
              </ul>
            </FigCard>
          ))}
        </FigGrid>
      </section>

      <section className="flex flex-col gap-5">
        <p className="label">Stack</p>
        <h2 className="text-xl font-semibold">扱える技術</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {stacks.map((stack) => (
            <div key={stack.label} className="fig-card">
              <p className="label">{stack.label}</p>
              <FigChips items={stack.items} />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <p className="label">Domains</p>
        <h2 className="text-xl font-semibold">携わった領域</h2>
        <p className="text-ink-dim">案件の単位ではなく、業種の単位で示す。</p>
        <FigChips items={domains} />
      </section>

      <section className="flex flex-col gap-5">
        <p className="label">Approach</p>
        <h2 className="text-xl font-semibold">考えていること</h2>
        <div className="panel panel-glow flex flex-col gap-4 px-5 py-6 text-ink-dim sm:px-7">
          <p>
            フロントエンドを軸にしつつ、担当を実装だけに閉じたくないと考えている。仕様の検討から運用保守まで関わると、画面の裏側で何が起きているかを踏まえて設計できるため、手戻りが減る。
          </p>
          <p>
            移行は一度で終わらないため、移行したあとに誰が触っても壊れない形まで持っていくことを重視している。最近は
            AI
            エージェントを前提とした開発環境の整備にも取り組んでおり、このサイトの文書もその一環として公開している。
          </p>
        </div>
      </section>
    </div>
  )
}
