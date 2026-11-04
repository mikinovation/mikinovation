import { createFileRoute } from '@tanstack/react-router'

import { NotFound } from '@/components/not-found'

export const Route = createFileRoute('/404')({
  head: () => ({
    meta: [{ title: 'ページが見つからない | Docs Hub' }],
  }),
  component: NotFound,
})
