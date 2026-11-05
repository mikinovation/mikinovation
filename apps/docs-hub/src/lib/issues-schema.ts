export const issueStatuses = ['doing', 'todo', 'done'] as const

export type IssueStatus = (typeof issueStatuses)[number]

export type Issue = {
  id: string
  title: string
  status: IssueStatus
}

export const issueTitleMaxLength = 60

const isStatus = (value: unknown): value is IssueStatus =>
  (issueStatuses as readonly unknown[]).includes(value)

const fail = (message: string): never => {
  throw new Error(`src/content/issues.yaml: ${message}`)
}

const toIssue = (value: unknown, position: number): Issue => {
  if (typeof value !== 'object' || value === null) {
    return fail(`${position}件目が項目になっていない`)
  }

  const { id, title, status } = value as Record<string, unknown>

  if (typeof id !== 'string' || !/^\d{4}$/.test(id)) {
    return fail(`${position}件目の id が4桁の数字でない`)
  }
  if (typeof title !== 'string' || title.length === 0) {
    return fail(`issue ${id} の title が空`)
  }
  if (title.length > issueTitleMaxLength) {
    return fail(
      `issue ${id} の title が${issueTitleMaxLength}文字を超える（${title.length}文字）`,
    )
  }
  if (!isStatus(status)) {
    return fail(
      `issue ${id} の status が ${issueStatuses.join(' / ')} のいずれでもない`,
    )
  }

  return { id, title, status }
}

export const parseIssues = (file: unknown): Issue[] => {
  if (typeof file !== 'object' || file === null) {
    return fail('トップレベルが issues キーを持つ対応表でない')
  }

  const { issues } = file as Record<string, unknown>
  if (!Array.isArray(issues)) {
    return fail('issues キーが配列でない')
  }

  const parsed = issues.map((issue, index) => toIssue(issue, index + 1))
  const duplicated = parsed.find(
    (issue, index) =>
      parsed.findIndex((other) => other.id === issue.id) < index,
  )
  if (duplicated !== undefined) {
    return fail(`id ${duplicated.id} が重複している`)
  }

  return parsed
}
