local telescopeFrecency = {}

function telescopeFrecency.config()
	return {
		"nvim-telescope/telescope-frecency.nvim",
		branch = "master",
		commit = "2c145e1240fea3eed03a9d9ee99f1bbd9c52a3dd",
		dependencies = {
			require("plugins.sqlite").config(),
		},
	}
end

return telescopeFrecency
