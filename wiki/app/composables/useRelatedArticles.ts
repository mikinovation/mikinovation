export type RelatedArticle = {
  title: string
  description: string
  slug: string
  path: string
  date: string | Date
  labels: string[]
}

export const useRelatedArticles = (slug: string) => {
  return useAsyncData(
    `related-articles-${slug}`,
    () => $fetch<RelatedArticle[]>(`/api/wiki/${slug}/related`)
  )
}
