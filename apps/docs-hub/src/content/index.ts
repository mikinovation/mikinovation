import type { DocEntry } from '@/lib/docs'

import * as prd0001 from './prd/0001_environment-setup'
import * as prd0002 from './prd/0002_editor-setup'
import * as prd0003 from './prd/0003_terminal-multiplexer'
import * as prd0004 from './prd/0004_ai-agent'
import * as prd0005 from './prd/0005_shell-setup'
import * as prd0006 from './prd/0006_note-taking'
import * as prd0008 from './prd/0008_editor-plugin-management'
import * as prd0009 from './prd/0009_refile-capture-reminder'
import * as prd0010 from './prd/0010_document-hub'
import * as adr0001 from './adr/0001_manage-environment-with-nix-flakes'
import * as adr0002 from './adr/0002_use-neovim-as-default-editor'
import * as adr0003 from './adr/0003_use-herdr-as-terminal-multiplexer'
import * as adr0004 from './adr/0004_manage-claude-code-with-home-manager'
import * as adr0005 from './adr/0005_use-zsh-with-sheldon-managed-plugins'
import * as adr0006 from './adr/0006_use-orgmode-and-org-roam-for-notes-and-tasks'
import * as adr0014 from './adr/0014_pin-neovim-plugins-by-commit-in-lazy-nvim-specs'
import * as adr0015 from './adr/0015_resolve-os-username-from-environment'
import * as adr0016 from './adr/0016_provide-skills-to-claude-code-on-the-web'
import * as adr0017 from './adr/0017_use-vitepress-for-document-hub'
import * as adr0018 from './adr/0018_use-bigram-tokenizer-for-japanese-search'
import * as adr0019 from './adr/0019_manage-issues-in-yaml'
import * as learn0001 from './learn/0001_nextjs-app-router-static-export'

export const docEntries: DocEntry[] = [
  {
    kind: 'prd',
    slug: '0001_environment-setup',
    ...prd0001.meta,
    Body: prd0001.default,
  },
  {
    kind: 'prd',
    slug: '0002_editor-setup',
    ...prd0002.meta,
    Body: prd0002.default,
  },
  {
    kind: 'prd',
    slug: '0003_terminal-multiplexer',
    ...prd0003.meta,
    Body: prd0003.default,
  },
  {
    kind: 'prd',
    slug: '0004_ai-agent',
    ...prd0004.meta,
    Body: prd0004.default,
  },
  {
    kind: 'prd',
    slug: '0005_shell-setup',
    ...prd0005.meta,
    Body: prd0005.default,
  },
  {
    kind: 'prd',
    slug: '0006_note-taking',
    ...prd0006.meta,
    Body: prd0006.default,
  },
  {
    kind: 'prd',
    slug: '0008_editor-plugin-management',
    ...prd0008.meta,
    Body: prd0008.default,
  },
  {
    kind: 'prd',
    slug: '0009_refile-capture-reminder',
    ...prd0009.meta,
    Body: prd0009.default,
  },
  {
    kind: 'prd',
    slug: '0010_document-hub',
    ...prd0010.meta,
    Body: prd0010.default,
  },
  {
    kind: 'adr',
    slug: '0001_manage-environment-with-nix-flakes',
    ...adr0001.meta,
    Body: adr0001.default,
  },
  {
    kind: 'adr',
    slug: '0002_use-neovim-as-default-editor',
    ...adr0002.meta,
    Body: adr0002.default,
  },
  {
    kind: 'adr',
    slug: '0003_use-herdr-as-terminal-multiplexer',
    ...adr0003.meta,
    Body: adr0003.default,
  },
  {
    kind: 'adr',
    slug: '0004_manage-claude-code-with-home-manager',
    ...adr0004.meta,
    Body: adr0004.default,
  },
  {
    kind: 'adr',
    slug: '0005_use-zsh-with-sheldon-managed-plugins',
    ...adr0005.meta,
    Body: adr0005.default,
  },
  {
    kind: 'adr',
    slug: '0006_use-orgmode-and-org-roam-for-notes-and-tasks',
    ...adr0006.meta,
    Body: adr0006.default,
  },
  {
    kind: 'adr',
    slug: '0014_pin-neovim-plugins-by-commit-in-lazy-nvim-specs',
    ...adr0014.meta,
    Body: adr0014.default,
  },
  {
    kind: 'adr',
    slug: '0015_resolve-os-username-from-environment',
    ...adr0015.meta,
    Body: adr0015.default,
  },
  {
    kind: 'adr',
    slug: '0016_provide-skills-to-claude-code-on-the-web',
    ...adr0016.meta,
    Body: adr0016.default,
  },
  {
    kind: 'adr',
    slug: '0017_use-vitepress-for-document-hub',
    ...adr0017.meta,
    Body: adr0017.default,
  },
  {
    kind: 'adr',
    slug: '0018_use-bigram-tokenizer-for-japanese-search',
    ...adr0018.meta,
    Body: adr0018.default,
  },
  {
    kind: 'adr',
    slug: '0019_manage-issues-in-yaml',
    ...adr0019.meta,
    Body: adr0019.default,
  },
  {
    kind: 'learn',
    slug: '0001_nextjs-app-router-static-export',
    ...learn0001.meta,
    Body: learn0001.default,
  },
]
