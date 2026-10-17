local gitsign = {}

function gitsign.config()
	return {
		"lewis6991/gitsigns.nvim",
		branch = "main",
		commit = "fd780920613e541cbdfac41bf711583ed49f9249",
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
