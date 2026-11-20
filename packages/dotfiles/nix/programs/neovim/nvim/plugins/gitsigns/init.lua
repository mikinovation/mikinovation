local gitsign = {}

function gitsign.config()
	return {
		"lewis6991/gitsigns.nvim",
		branch = "main",
		commit = "c0862d382a35b7b45757d8d151a6a634c09bf3ce",
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
