import { z } from 'zod'

export const grillingQuestionsMaxCount = 6
export const grillingTitleMaxLength = 40
export const grillingTextMaxLength = 200
export const grillingOptionsMaxCount = 5

const text = (label: string, max = grillingTextMaxLength) =>
  z
    .string()
    .min(1, `${label} を空にしない`)
    .max(max, `${label} は${max}文字以内にする`)

export const grillingQuestionSchema = z.object({
  id: z.string().regex(/^q\d+$/, 'id は q と数字にする'),
  title: text('title', grillingTitleMaxLength),
  question: text('question'),
  options: z
    .array(text('options'))
    .min(2, 'options は2つ以上にする')
    .max(
      grillingOptionsMaxCount,
      `options は${grillingOptionsMaxCount}つ以内にする`,
    ),
  recommendation: text('recommendation'),
  rationale: text('rationale').optional(),
  followUp: text('followUp').optional(),
  decision: text('decision').optional(),
})

export type GrillingQuestion = z.infer<typeof grillingQuestionSchema>

export const grillingFileSchema = z.object({
  issueId: z.string().regex(/^\d{4}$/, 'issueId は4桁の数字にする'),
  generatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'generatedAt は YYYY-MM-DD にする'),
  questions: z
    .array(grillingQuestionSchema)
    .min(1, 'questions を空にしない')
    .max(
      grillingQuestionsMaxCount,
      `questions は${grillingQuestionsMaxCount}問以内にする`,
    )
    .refine(
      (questions) =>
        new Set(questions.map((question) => question.id)).size ===
        questions.length,
      { error: 'questions の id が重複している' },
    ),
})

export type GrillingFile = z.infer<typeof grillingFileSchema>
