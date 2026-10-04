local nvimWebDevicons = {}

function nvimWebDevicons.config()
	return {
		"nvim-tree/nvim-web-devicons",
		branch = "master",
		commit = "58447c1fca354bbf184425e4a8d01deecbd6f3c4",
		enabled = vim.g.have_nerd_font,
	}
end

return nvimWebDevicons
