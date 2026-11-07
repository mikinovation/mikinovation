local neogit = {}

function neogit.config()
	return {
		"NeogitOrg/neogit",
		branch = "master",
		commit = "ba2f33b64b996ff5530c4c45a3c432fb63aaa95b",
		cmd = { "Neogit", "NeogitResetState" },
		dependencies = {
			require("plugins.plenary").config(),
		},
		config = true,
	}
end

return neogit
