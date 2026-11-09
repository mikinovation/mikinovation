import { z } from 'zod'

import { repositoryIds } from './repositories.ts'

export const issueTitleMaxLength = 60

export const issueStatusSchema = z.enum(['doing', 'todo', 'proposed', 'done'], {
  error: 'status は doing、todo、proposed、done のいずれかにする',
})

export type IssueStatus = z.infer<typeof issueStatusSchema>

export const issueRepositoryValues = [...repositoryIds, 'common'] as const

export const issueRepositorySchema = z.enum(issueRepositoryValues, {
  error: `repository は ${issueRepositoryValues.join('、')} のいずれかにする`,
})

export type IssueRepository = z.infer<typeof issueRepositorySchema>

export const issueSchema = z.object({
  id: z.string().regex(/^\d{4}$/, 'id は4桁の数字にする'),
  title: z
    .string()
    .min(1, 'title を空にしない')
    .max(issueTitleMaxLength, `title は${issueTitleMaxLength}文字以内にする`),
  status: issueStatusSchema,
  repository: issueRepositorySchema,
})

export type Issue = z.infer<typeof issueSchema>

export const issueFileSchema = z.object({
  issues: z
    .array(issueSchema)
    .refine(
      (issues) =>
        new Set(issues.map((issue) => issue.id)).size === issues.length,
      { error: 'id が重複している' },
    ),
})

export type IssueFile = z.infer<typeof issueFileSchema>
