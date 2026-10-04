local vimFugitive = {}

function vimFugitive.config()
	return {
		"tpope/vim-fugitive",
		branch = "master",
		commit = "3b753cf8c6a4dcde6edee8827d464ba9b8c4a6f0",
		-- plugins/vim-fugitive/keymaps.lua registers ~40 <leader>g* mappings,
		-- too many to enumerate as lazy keys, so defer to just after startup.
		event = "VeryLazy",
		config = function()
			require("plugins.vim-fugitive.keymaps").setup()
		end,
	}
end

return vimFugitive
