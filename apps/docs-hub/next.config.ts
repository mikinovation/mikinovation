import { join } from 'node:path'

import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const docLinks = join(process.cwd(), 'src/lib/remark-doc-links.mjs')

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '/mikinovation',
  pageExtensions: ['ts', 'tsx', 'mdx'],
}

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm', docLinks],
    rehypePlugins: ['rehype-slug'],
  },
})

export default withMDX(nextConfig)
