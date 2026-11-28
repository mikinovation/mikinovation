local telescopeFrecency = {}

function telescopeFrecency.config()
	return {
		"nvim-telescope/telescope-frecency.nvim",
		branch = "master",
		commit = "2f60a09c5f56fd5a6feaee5efcbf10548f61afde",
		dependencies = {
			require("plugins.sqlite").config(),
		},
	}
end

return telescopeFrecency
