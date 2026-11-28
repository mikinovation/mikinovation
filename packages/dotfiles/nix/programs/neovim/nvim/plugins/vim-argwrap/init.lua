local vimArgwrap = {}

function vimArgwrap.config()
	return {
		"FooSoft/vim-argwrap",
		branch = "master",
		commit = "663707b64000857d03690ec935bf885341fc93d9",
		cmd = "ArgWrap",
		-- Keep in sync with plugins/vim-argwrap/keymaps.lua
		keys = {
			{ "<leader>aw", desc = "Argwrap" },
		},
		config = function()
			require("plugins.vim-argwrap.keymaps").setup()
		end,
	}
end

return vimArgwrap
