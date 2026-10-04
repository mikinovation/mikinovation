local neogit = {}

function neogit.config()
	return {
		"NeogitOrg/neogit",
		branch = "master",
		commit = "70708be9664b7fcdd010eb07bdc3ebc9311c2027",
		cmd = { "Neogit", "NeogitResetState" },
		dependencies = {
			require("plugins.plenary").config(),
		},
		config = true,
	}
end

return neogit
