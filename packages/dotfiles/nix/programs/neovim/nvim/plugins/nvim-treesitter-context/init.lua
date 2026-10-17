local nvimTreesitterContext = {}

function nvimTreesitterContext.config()
	return {
		"nvim-treesitter/nvim-treesitter-context",
		branch = "master",
		commit = "8decd73460d26ef0a0befb745d022dd1fc2c38b8",
		event = { "BufReadPost", "BufNewFile" },
		config = function()
			require("treesitter-context").setup()
		end,
	}
end

return nvimTreesitterContext
