local gitConflict = {}

function gitConflict.config()
	return {
		"akinsho/git-conflict.nvim",
		commit = "bfd9fe6fba9a161fc199771d85996236a0d0faad",
		event = { "BufReadPost", "BufNewFile" },
		config = function()
			require("git-conflict").setup({
				default_mappings = false,
			})

			require("plugins.git-conflict.keymaps").setup()
		end,
	}
end

return gitConflict
