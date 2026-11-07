local gitsign = {}

function gitsign.config()
	return {
		"lewis6991/gitsigns.nvim",
		branch = "main",
		commit = "ef707fb93301a9b856f36eae4c8f56f5b988a794",
		event = { "BufReadPre", "BufNewFile" },
		opts = {
			signs = {
				add = { text = "+" },
				change = { text = "~" },
				delete = { text = "_" },
				topdelete = { text = "‾" },
				changedelete = { text = "~" },
			},
		},
	}
end

return gitsign
