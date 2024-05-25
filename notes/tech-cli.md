# CLI

## ターミナル(WezTerm)

WezTermの設定

WSLではなく、Windowsのhomeに.wezterm.luaを設置する必要がある

githubで管理したいが一時的にメモ

```.wezterm.lua
local wezterm = require 'wezterm'
local config = wezterm.config_builder()
local act = wezterm.action

config.default_domain = 'WSL:Ubuntu'
config.keys = {
  { key = 'V', mods = 'CTRL', action = act.PasteFrom 'Clipboard' }
}
config.color_scheme = 'Rapture'
config.window_background_opacity = 0.85

config.font = wezterm.font("JetBrains Mono")
config.font_size = 10.0

return config
```
