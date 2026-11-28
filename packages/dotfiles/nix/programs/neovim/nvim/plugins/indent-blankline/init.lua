local indentBlankline = {}

function indentBlankline.config()
	return {
		"lukas-reineke/indent-blankline.nvim",
		branch = "master",
		commit = "fbc6d88222b5f75613cb95a22e89aa2f4e318a81",
		main = "ibl",
		event = { "BufReadPost", "BufNewFile" },
		opts = {},
	}
end

return indentBlankline
