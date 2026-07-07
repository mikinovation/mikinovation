#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC_DIR = path.resolve(__dirname, '../content/wiki-src')
const OUT_DIR = path.resolve(__dirname, '../content/wiki')

const KEYWORD_TO_FIELD = {
  title: 'title',
  description: 'description',
  date: 'date',
  draft: 'draft',
  labels: 'labels',
  related_articles: 'relatedArticles',
}

const ARRAY_FIELDS = new Set(['labels', 'relatedArticles'])
const BOOLEAN_FIELDS = new Set(['draft'])

function parseOrgFile(raw) {
  const keywordPattern = /^#\+([A-Za-z_]+):\s?(.*)$/
  const meta = {}
  const bodyLines = []

  for (const line of raw.split('\n')) {
    const match = line.match(keywordPattern)
    const field = match && KEYWORD_TO_FIELD[match[1].toLowerCase()]
    if (field) {
      meta[field] = match[2].trim()
    } else {
      bodyLines.push(line)
    }
  }

  for (const field of ARRAY_FIELDS) {
    meta[field] = typeof meta[field] === 'string'
      ? meta[field].split(',').map((s) => s.trim()).filter(Boolean)
      : []
  }
  for (const field of BOOLEAN_FIELDS) {
    meta[field] = meta[field] === 'true'
  }

  return { meta, body: bodyLines.join('\n').trim() }
}

function orgBodyToMarkdown(orgBody) {
  // Pandoc's org reader mimics Org's export headline-levels option (default
  // depth 3) and demotes deeper headings into lists. Raise the limit so
  // arbitrarily deep `****` headings still convert to markdown headings.
  const input = `#+OPTIONS: H:10\n${orgBody}`
  return execFileSync('pandoc', ['-f', 'org', '-t', 'gfm', '--wrap=preserve'], {
    input,
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 20,
  }).trim()
}

async function convertFile(fileName) {
  const raw = await readFile(path.join(SRC_DIR, fileName), 'utf-8')
  const { meta, body } = parseOrgFile(raw)
  const markdownBody = orgBodyToMarkdown(body)
  const output = matter.stringify(`\n${markdownBody}\n`, meta)
  const outName = fileName.replace(/\.org$/, '.md')
  await writeFile(path.join(OUT_DIR, outName), output, 'utf-8')
  console.log(`[convert-org] ${fileName} -> ${outName}`)
}

async function main() {
  if (!existsSync(SRC_DIR)) {
    console.log(`[convert-org] skip: ${SRC_DIR} not found`)
    return
  }

  try {
    execFileSync('pandoc', ['--version'], { stdio: 'ignore' })
  } catch {
    throw new Error('pandoc is required to convert .org files but was not found in PATH.')
  }

  await mkdir(OUT_DIR, { recursive: true })
  const entries = await readdir(SRC_DIR, { withFileTypes: true })
  const orgFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.org'))
    .map((entry) => entry.name)

  await Promise.all(orgFiles.map(convertFile))
}

main().catch((error) => {
  console.error('[convert-org] failed:', error.message)
  process.exitCode = 1
})
