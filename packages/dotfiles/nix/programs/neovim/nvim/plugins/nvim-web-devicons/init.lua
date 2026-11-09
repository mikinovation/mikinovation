local nvimWebDevicons = {}

function nvimWebDevicons.config()
	return {
		"nvim-tree/nvim-web-devicons",
		branch = "master",
		commit = "0dc0cfb0c6858041174a53c7aa4adaf65e994b3c",
		enabled = vim.g.have_nerd_font,
	}
end

return nvimWebDevicons
