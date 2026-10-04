local dropbar = {}

function dropbar.config()
	return {
		"Bekaboo/dropbar.nvim",
		branch = "master",
		commit = "f7c6fa21e2a7c32576e7a1791774a3736987f467",
		event = "VeryLazy",
		-- optional, but required for fuzzy finder support
		dependencies = {
			require("plugins.telescope-fzf-native").config(),
		},
		config = function()
			require("plugins.dropbar.keymaps").setup()
		end,
	}
end

return dropbar
