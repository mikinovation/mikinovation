local luasnip = {}

function luasnip.config()
	return {
		"L3MON4D3/LuaSnip",
		branch = "master",
		commit = "0abc8f390b278c3b4aabc4c004ac8a088b65cf24",
		build = "make install_jsregexp",
		dependencies = {
			require("plugins.friendly-snippets").config(),
		},
	}
end

return luasnip
