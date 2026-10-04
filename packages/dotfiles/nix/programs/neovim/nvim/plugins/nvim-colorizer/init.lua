local nvimColorizer = {}

function nvimColorizer.config()
	return {
		"catgoose/nvim-colorizer.lua",
		branch = "master",
		commit = "72a05f62c52241bc7441c820eb53946f92b2e6a4",
		event = "BufReadPre",
		opts = {
			options = {
				parsers = {
					tailwind = { enable = true, lsp = true },
				},
			},
		},
	}
end

return nvimColorizer
