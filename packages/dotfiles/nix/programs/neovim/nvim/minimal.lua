-- luacheck: globals vim

-- Entry point for the minimal profile. Home Manager deploys this file as
-- init.lua. It loads no plugin manager, plugin or language server, so Neovim
-- starts without a network connection on a fresh or broken machine.

local config_path = vim.fn.stdpath("config")
package.path = package.path .. ";" .. config_path .. "/?.lua;" .. config_path .. "/?/init.lua"

require("core").setup()
require("core_keymaps").setup()
