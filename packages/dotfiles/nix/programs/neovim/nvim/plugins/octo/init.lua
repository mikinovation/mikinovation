local octo = {}

function octo.config()
	return {
		"pwntester/octo.nvim",
		branch = "master",
		commit = "4b229445735c394ad9659ab28dc9285a26782356",
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
