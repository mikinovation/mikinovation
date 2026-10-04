local lualine = {}

function lualine.config()
	return {
		"nvim-lualine/lualine.nvim",
		commit = "221ce6b2d999187044529f49da6554a92f740a96",
		event = "VeryLazy",
		dependencies = {
			require("plugins.nvim-web-devicons").config(),
		},
		opts = {
			options = {
				icons_enabled = true,
				theme = "nightfly",
			},
		},
	}
end

return lualine
