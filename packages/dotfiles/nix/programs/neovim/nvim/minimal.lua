-- luacheck: globals vim

-- Entry point for the minimal profile. Home Manager deploys this file as
-- init.lua. Besides the built-in config, it loads only the plugins for notes
-- and tasks (nvim-orgmode and org-roam.nvim), with the same pinned specs as
-- the full profile. It loads no language server.

local config_path = vim.fn.stdpath("config")
package.path = package.path .. ";" .. config_path .. "/?.lua;" .. config_path .. "/?/init.lua"

require("core").setup()
require("core_keymaps").setup()

require("plugins").setup({
	require("plugins.orgmode").config(),
	require("plugins.org-roam").config(),
})
