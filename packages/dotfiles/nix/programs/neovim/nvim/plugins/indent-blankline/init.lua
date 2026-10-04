local indentBlankline = {}

function indentBlankline.config()
	return {
		"lukas-reineke/indent-blankline.nvim",
		branch = "master",
		commit = "f1e186e44d3b7f9ae918008e2c28ce37c6023d2d",
		main = "ibl",
		event = { "BufReadPost", "BufNewFile" },
		opts = {},
	}
end

return indentBlankline
