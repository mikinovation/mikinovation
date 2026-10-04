local nvimTreesitterContext = {}

function nvimTreesitterContext.config()
	return {
		"nvim-treesitter/nvim-treesitter-context",
		branch = "master",
		commit = "f3061339b8eaf9fda873600bc425b8d2d8502533",
		event = { "BufReadPost", "BufNewFile" },
		config = function()
			require("treesitter-context").setup()
		end,
	}
end

return nvimTreesitterContext
