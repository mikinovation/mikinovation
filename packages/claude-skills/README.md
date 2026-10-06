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

Install the plugins with one of two scopes.

| Scope | Settings file | Where the skills are available |
|---|---|---|
| `user` | `~/.claude/settings.json` | Every repository on the machine |
| `project` | `<repository>/.claude/settings.json` | The repository, including Claude Code on the web and mobile after the file is committed |

Claude Code on the web and mobile does not read user settings, so use
`project` for repositories that should have the skills there. For `project`,
run the commands in the root of the repository.

```sh
SCOPE=user # or project
claude plugin marketplace add mikinovation/mikinovation --scope "$SCOPE"
for plugin in mikinovation-skills tanteki yomiyasu mattpocock-skills commit-commands; do
  claude plugin install "$plugin@mikinovation" --scope "$SCOPE"
done
```

Machines with the dotfiles already have the skills under their plain names, so
installing the plugins there shows each skill twice.

The commands write the following settings to the settings file of the scope.
Adding them by hand has the same effect.

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

This repository itself does not install `mikinovation-skills` as a plugin.
Instead, `.claude/skills/` holds a symlink to each skill under `skills/`, so
Claude Code loads them as project skills under their plain names, for example
`/create-prd`, and picks up edits without reinstalling. `.claude/settings.json`
enables only the plugins for the skills they call. When adding a skill, add
its symlink too:

```sh
ln -s ../../packages/claude-skills/skills/<name> .claude/skills/<name>
```

Claude Code on the web and mobile does not install the plugins enabled in
`.claude/settings.json` by itself. The SessionStart hook
`.claude/hooks/session-start.sh` adds the marketplaces and installs the enabled
plugins at the start of each remote session. It reads both lists from
`.claude/settings.json`, so enabling a plugin there is enough. The hook does
nothing on local machines.
