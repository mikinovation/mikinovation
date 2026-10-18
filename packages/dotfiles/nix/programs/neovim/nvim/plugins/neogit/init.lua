local neogit = {}

function neogit.config()
	return {
		"NeogitOrg/neogit",
		branch = "master",
		commit = "a6549816e62cec7037f1549d8f1659d45635370c",
		cmd = { "Neogit", "NeogitResetState" },
		dependencies = {
			require("plugins.plenary").config(),
		},
		config = true,
	}
end

return neogit
