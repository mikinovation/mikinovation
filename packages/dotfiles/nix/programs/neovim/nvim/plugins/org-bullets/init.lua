local orgBullets = {}

function orgBullets.config()
	return {
		"nvim-orgmode/org-bullets.nvim",
		branch = "main",
		commit = "503fe053550879cc202086a40454e46a87c41ddb",
		dependencies = { "nvim-orgmode/orgmode" },
		event = "VeryLazy",
		config = function()
			require("org-bullets").setup({})
		end,
	}
end

return orgBullets
