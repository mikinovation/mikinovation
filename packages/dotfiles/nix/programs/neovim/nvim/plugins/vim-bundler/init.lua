local vimBundler = {}

function vimBundler.config()
	return {
		"tpope/vim-bundler",
		branch = "master",
		commit = "64a448589e5e238cce0030d08984368ddc3851ac",
		ft = { "ruby", "eruby" },
	}
end

return vimBundler
