local dropbar = {}

function dropbar.config()
	return {
		"Bekaboo/dropbar.nvim",
		branch = "master",
		commit = "75df03973f3a06a85300bc8ca1f9f68e935cb78e",
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
