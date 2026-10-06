# claude-skills

Claude Code skills for writing documents (PRD, ADR, design docs, plans, test
cases), reviewing Japanese text, and creating branches and pull requests. Each
skill is a directory under `skills/`.

The dotfiles deploy these skills to `~/.claude/skills` with Home Manager.
Claude Code on the web and mobile cannot read that directory, so the
repository root also publishes this package as the `mikinovation` plugin
marketplace (`.claude-plugin/marketplace.json`), together with the skills they
call: tanteki, yomiyasu, mattpocock/skills for `grilling`, and the official
commit-commands plugin for `commit`.

## Install

Run the following in the root of the repository that should use the skills.
`--scope project` writes the marketplace and the plugins to the repository's
`.claude/settings.json`. Commit that file, and Claude Code on the web and
mobile installs the plugins when a session starts in the repository.

```sh
claude plugin marketplace add mikinovation/mikinovation --scope project
claude plugin install mikinovation-skills@mikinovation --scope project
claude plugin install tanteki@mikinovation --scope project
claude plugin install yomiyasu@mikinovation --scope project
claude plugin install mattpocock-skills@mikinovation --scope project
claude plugin install commit-commands@mikinovation --scope project
```

The commands write the following settings. Adding them to
`.claude/settings.json` by hand has the same effect. This repository already
has them.

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

On a machine without the dotfiles, omit `--scope project` to install the
plugins for the user instead. Machines with the dotfiles already have the
skills under their plain names, so installing the plugins there shows each
skill twice.

Plugin skills are namespaced, for example `/mikinovation-skills:create-prd`.
