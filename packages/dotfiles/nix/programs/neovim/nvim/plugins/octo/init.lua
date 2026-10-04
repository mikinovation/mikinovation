local octo = {}

function octo.config()
	return {
		"pwntester/octo.nvim",
		branch = "master",
		commit = "af2411604b51cb4a0f3e2de50b1b7cacc2581c48",
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
