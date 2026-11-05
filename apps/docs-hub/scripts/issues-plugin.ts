import type { Plugin } from 'vite'

import { readFileSync } from 'node:fs'
import { parse } from 'yaml'

import { parseIssues } from '../src/lib/issues-schema'

const suffix = 'src/content/issues.yaml'

export const issuesYaml = (): Plugin => ({
  name: 'issues-yaml',
  enforce: 'pre',
  transform(_code, id) {
    if (!id.endsWith(suffix)) {
      return null
    }

    const issues = parseIssues(parse(readFileSync(id, 'utf8')))

    return {
      code: `export default ${JSON.stringify({ issues })}`,
      map: null,
    }
  },
})
