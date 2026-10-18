local nvimWebDevicons = {}

function nvimWebDevicons.config()
	return {
		"nvim-tree/nvim-web-devicons",
		branch = "master",
		commit = "ec309a0eaff6ea967e58c275996155ab5c16938d",
		enabled = vim.g.have_nerd_font,
	}
end

return nvimWebDevicons
