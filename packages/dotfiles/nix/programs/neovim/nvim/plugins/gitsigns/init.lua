local gitsign = {}

function gitsign.config()
	return {
		"lewis6991/gitsigns.nvim",
		branch = "main",
		commit = "070a5d7b985546cc57e1fc61e5bc507fecac6045",
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
