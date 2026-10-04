local telescopeFrecency = {}

function telescopeFrecency.config()
	return {
		"nvim-telescope/telescope-frecency.nvim",
		commit = "5479d8a269e30479280c59e44f805396127653e6",
		dependencies = {
			require("plugins.sqlite").config(),
		},
	}
end

return telescopeFrecency
