export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  // 現在の記事を取得
  const currentArticle = await queryCollection(event, 'wiki')
    .path(`/wiki/${slug}`)
    .first()

  if (!currentArticle) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Article not found'
    })
  }

  // すべての記事を取得
  const allArticles = await queryCollection(event, 'wiki').all()

  // スラッグ抽出用のヘルパー関数
  const extractSlug = (path: string): string => {
    const pathParts = path.split('/')
    return pathParts[pathParts.length - 1]
  }

  const currentSlug = extractSlug(currentArticle.path)

  // 1. 現在の記事から参照している記事のスラッグ
  const directRelatedSlugs = currentArticle.relatedArticles || []

  // 2. 現在の記事を参照している記事（逆方向）のスラッグ
  const reverseRelatedSlugs = allArticles
    .filter((article) => {
      const articleRelated = article.relatedArticles || []
      return articleRelated.includes(currentSlug)
    })
    .map((article) => extractSlug(article.path))

  // 3. 双方向の関連記事スラッグを統合（重複排除）
  const allRelatedSlugs = [...new Set([...directRelatedSlugs, ...reverseRelatedSlugs])]

  // 関連記事の詳細を取得
  const relatedArticles = allArticles
    .filter((article) => {
      const articleSlug = extractSlug(article.path)
      return allRelatedSlugs.includes(articleSlug)
    })
    .map((article) => ({
      title: article.title,
      description: article.description,
      slug: extractSlug(article.path),
      path: article.path,
      date: article.date,
      labels: article.labels || []
    }))

  return relatedArticles
})
