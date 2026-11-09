local octo = {}

function octo.config()
	return {
		"pwntester/octo.nvim",
		branch = "master",
		commit = "419e67aee457406423e7cb4fc41d721ecda61bcd",
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
