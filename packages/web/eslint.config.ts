import { globalIgnores } from 'eslint/config'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  globalIgnores(['./**/*']),
])
