local vimArgwrap = {}

function vimArgwrap.config()
	return {
		"FooSoft/vim-argwrap",
		commit = "03615d1eed248408567bc8fa6a5a8c94ef3cd170",
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
