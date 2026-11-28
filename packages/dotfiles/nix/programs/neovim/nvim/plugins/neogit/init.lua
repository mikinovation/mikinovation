local neogit = {}

function neogit.config()
	return {
		"NeogitOrg/neogit",
		branch = "master",
		commit = "0468adaa4af22ede35c0df6bdd81e93a9c217733",
		cmd = { "Neogit", "NeogitResetState" },
		dependencies = {
			require("plugins.plenary").config(),
		},
		config = true,
	}
end

return neogit
