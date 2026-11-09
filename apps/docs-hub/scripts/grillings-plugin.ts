import type { Plugin } from 'vite'

import { readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { z } from 'zod'

import { grillingFileSchema } from '../src/lib/grillings-schema'

const directory = 'src/content/grillings/'

export const grillingsYaml = (): Plugin => ({
  name: 'grillings-yaml',
  enforce: 'pre',
  transform(_code, id) {
    if (!id.includes(directory) || !id.endsWith('.yaml')) {
      return null
    }

    const result = grillingFileSchema.safeParse(parse(readFileSync(id, 'utf8')))
    if (!result.success) {
      throw new Error(
        `${directory}${id.split('/').pop()}\n${z.prettifyError(result.error)}`,
      )
    }

    return {
      code: `export default ${JSON.stringify(result.data)}`,
      map: null,
    }
  },
})
