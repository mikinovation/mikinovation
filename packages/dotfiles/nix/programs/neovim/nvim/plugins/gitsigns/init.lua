local gitsign = {}

function gitsign.config()
	return {
		"lewis6991/gitsigns.nvim",
		branch = "main",
		commit = "d4854fa9a94b5c8b37dd209fb4a19e98e764186f",
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
