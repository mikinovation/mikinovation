local vimRails = {}

function vimRails.config()
	return {
		"tpope/vim-rails",
		branch = "master",
		commit = "b0a5c76f86ea214ade36ab0b811e730c3f0add67",
		ft = { "ruby", "eruby", "haml", "slim" },
	}
end

return vimRails
