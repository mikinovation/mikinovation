# claude-skills

Claude Code skills for writing documents (PRD, ADR, design docs, plans, test
cases), reviewing Japanese text, and creating branches and pull requests. Each skill is a directory under `skills/`.

The dotfiles deploy these skills to `~/.claude/skills` with Home Manager.
Claude Code on the web and mobile cannot read that directory, so the
repository root also publishes this package as the `mikinovation` plugin
marketplace (`.claude-plugin/marketplace.json`), together with the skills they
call: tanteki, yomiyasu, mattpocock/skills for `grilling`, and the official
commit-commands plugin for `commit`. This repository enables them in
`.claude/settings.json`. To use them in another repository, add the same
settings to its `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "mikinovation": {
      "source": { "source": "github", "repo": "mikinovation/mikinovation" }
    }
  },
  "enabledPlugins": {
    "mikinovation-skills@mikinovation": true,
    "tanteki@mikinovation": true,
    "yomiyasu@mikinovation": true,
    "mattpocock-skills@mikinovation": true,
    "commit-commands@mikinovation": true
  }
}
```

Plugin skills are namespaced, for example `/mikinovation-skills:create-prd`.
