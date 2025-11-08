import { defineCollection, z } from '@nuxt/content'

export const collections = {
  wiki: defineCollection({
    source: 'wiki/**/*.md',
    type: 'page',
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.string().or(z.date()),
      draft: z.boolean().optional().default(false),
      labels: z.array(z.string()),
      relatedArticles: z.array(z.string()),
    })
  })
}
