import { Hero } from '@/components/doc-page'
import { SiteLink } from '@/components/site-link'

export function NotFound() {
  return (
    <div className="flex flex-col gap-8">
      <Hero
        trail={[{ label: 'Docs Hub', href: '/' }, { label: '404' }]}
        title="ページが見つからない"
        compact
        lead="指定された URL の文書はない。文書を改名すると URL も変わるため、一覧からたどり直してほしい。"
      />

      <SiteLink href="/" className="nav-link">
        <span>← 一覧へ戻る</span>
      </SiteLink>
    </div>
  )
}
