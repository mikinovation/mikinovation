import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'
import { parseOrgRoam } from '~~/server/utils/parseOrgRoam'

export default defineEventHandler(async () => {
  const path = resolve(process.cwd(), 'data/issue.org')
  const text = await fs.readFile(path, 'utf-8').catch(() => '')
  return parseOrgRoam(text)
})
