#!/usr/bin/env node
// issues.yaml を zod スキーマに通し、追加と着手に必要な要約を出す。
// 検査を通れば 0、通らなければ 1、実行場所や引数が誤っていれば 2 で終わる。
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

if (process.argv.length > 3) {
  console.error(`usage: ${process.argv[1]} [issues.yaml のパス]`)
  process.exit(2)
}

let root
try {
  root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
} catch {
  console.error('NG: mikinovation リポジトリの中で実行する')
  process.exit(2)
}

const docsHub = join(root, 'apps/docs-hub')
const schemaPath = join(docsHub, 'src/lib/issues-schema.ts')
const yamlPath = process.argv[2] === undefined
  ? join(docsHub, 'src/content/issues.yaml')
  : resolve(process.argv[2])

for (const path of [yamlPath, schemaPath, join(docsHub, 'node_modules')]) {
  if (!existsSync(path)) {
    console.error(
      `NG: ${path} がない。mikinovation リポジトリで pnpm install を済ませて実行する`,
    )
    process.exit(2)
  }
}

const require = createRequire(join(docsHub, 'package.json'))
const yaml = await import(pathToFileURL(require.resolve('yaml')))
const { issueFileSchema } = await import(pathToFileURL(schemaPath))
const { z } = await import(pathToFileURL(require.resolve('zod')))

const shown = yamlPath.startsWith(root) ? relative(root, yamlPath) : yamlPath
const parse = yaml.parse ?? yaml.default.parse
const result = issueFileSchema.safeParse(parse(await readFile(yamlPath, 'utf8')))
if (!result.success) {
  console.error(`NG: ${shown}\n${z.prettifyError(result.error)}`)
  process.exit(1)
}

const issues = result.data.issues
const count = (status) =>
  issues.filter((issue) => issue.status === status).length
const maxId = issues.reduce(
  (max, issue) => (issue.id > max ? issue.id : max),
  '0000',
)
const nextId = String(Number(maxId) + 1).padStart(4, '0')

console.log(`OK: ${shown}  ${issues.length} issues`)
console.log(`next id: ${nextId}`)
console.log(
  ['doing', 'todo', 'proposed', 'done']
    .map((status) => `${status}: ${count(status)}`)
    .join('  '),
)
for (const issue of issues) {
  console.log(
    `${issue.id}  ${issue.status.padEnd(8)}  ${issue.repository.padEnd(22)}  ${issue.title}`,
  )
}
