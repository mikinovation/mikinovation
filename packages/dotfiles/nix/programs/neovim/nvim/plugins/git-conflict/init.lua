local gitConflict = {}

function gitConflict.config()
	return {
		"akinsho/git-conflict.nvim",
		-- renovate: tag=v2.1.0
		commit = "4bbfdd92d547d2862a75b4e80afaf30e73f7bbb4",
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
