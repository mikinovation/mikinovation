import type { Plugin } from 'vite'

import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { z } from 'zod'

import { issueFileSchema } from '../src/lib/issues-schema'

const suffix = 'src/content/issues.yaml'

export const issuesYaml = (): Plugin => ({
  name: 'issues-yaml',
  enforce: 'pre',
  transform(_code, id) {
    if (!id.endsWith(suffix)) {
      return null
    }

    const result = issueFileSchema.safeParse(parse(readFileSync(id, 'utf8')))
    if (!result.success) {
      throw new Error(`${suffix}\n${z.prettifyError(result.error)}`)
    }

    return {
      code: `export default ${JSON.stringify(result.data)}`,
      map: null,
    }
  },
})
