import Link from 'next/link'

export function SiteHeader() {
  return (
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

        <Link
          href="/repositories"
          className="label transition-colors hover:text-neon-soft"
        >
          Repositories
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
  )
}
