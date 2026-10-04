-- core.lua
-- Base settings shared by the full and minimal profiles.
-- Only built-in features are used here, so this works without any plugin.

local M = {}

function M.setup()
	vim.g.mapleader = " "
	vim.g.maplocalleader = " "
	vim.g.have_nerd_font = false

	require("options")
	require("plugins.clipboard").config()
end

return M
