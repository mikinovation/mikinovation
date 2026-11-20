local neogit = {}

function neogit.config()
	return {
		"NeogitOrg/neogit",
		branch = "master",
		commit = "17929b7b0b9c05fe3dfc788fbba9881eb9c1cbec",
		cmd = { "Neogit", "NeogitResetState" },
		dependencies = {
			require("plugins.plenary").config(),
		},
		config = true,
	}
end

return neogit
