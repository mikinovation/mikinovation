#!/usr/bin/env node
import { readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const contentRoot = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
  'content',
)

const kinds = ['prd', 'adr', 'design']

const docs = kinds.flatMap((kind) =>
  readdirSync(join(contentRoot, kind))
    .filter((name) => name.endsWith('.tsx'))
    .toSorted()
    .map((name) => ({
      kind,
      slug: name.slice(0, -'.tsx'.length),
      identifier: `${kind}${name.slice(0, 4)}`,
    })),
)

const imports = docs.map(
  (doc) => `import * as ${doc.identifier} from './${doc.kind}/${doc.slug}'`,
)

const entries = docs.map(
  (doc) => `  {
    kind: '${doc.kind}',
    slug: '${doc.slug}',
    ...${doc.identifier}.meta,
    Body: ${doc.identifier}.default,
  },`,
)

writeFileSync(
  join(contentRoot, 'index.ts'),
  `import type { DocEntry } from '@/lib/docs'

${imports.join('\n')}

export const docEntries: DocEntry[] = [
${entries.join('\n')}
]
`,
)

console.log(`索引に並べた文書: ${docs.length}`)
