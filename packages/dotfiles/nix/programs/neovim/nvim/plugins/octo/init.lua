local octo = {}

function octo.config()
	return {
		"pwntester/octo.nvim",
		branch = "master",
		commit = "0ddca04c02aab8ba18d2072f9b855f3806adad54",
		cmd = "Octo",
		dependencies = {
			require("plugins.plenary").config(),
			require("plugins.telescope").config(),
			require("plugins.nvim-web-devicons").config(),
		},
		config = function()
			require("octo").setup({})
		end,
	}
end

return octo
