local lazydev = {}

function lazydev.config()
	return {
		"folke/lazydev.nvim",
		commit = "ff2cbcba459b637ec3fd165a2be59b7bbaeedf0d",
		ft = "lua",
		opts = {
			library = {
				{ path = "luvit-meta/library", words = { "vim%.uv" } },
			},
		},
	}
end

return lazydev
