import type { GrillingFile } from '@/lib/grillings-schema'

const files = import.meta.glob<GrillingFile>('../content/grillings/*.yaml', {
  eager: true,
  import: 'default',
})

const grillings = new Map(
  Object.values(files).map((file) => [file.issueId, file]),
)

export const findGrilling = (issueId: string): GrillingFile | null =>
  grillings.get(issueId) ?? null

export const hasGrilling = (issueId: string): boolean => grillings.has(issueId)

export const countGrillings = (): number => grillings.size
