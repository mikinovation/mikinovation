local octo = {}

function octo.config()
	return {
		"pwntester/octo.nvim",
		branch = "master",
		commit = "8461d99d13cca243f89848bf4d9fadee096f0a48",
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
