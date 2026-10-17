local copilot = {}

function copilot.config()
	return {
		"zbirenbaum/copilot.lua",
		branch = "master",
		commit = "3f1f8cc30783ca905224eadebaa6ddfd73c28828",
		cmd = "Copilot",
		event = "InsertEnter",
		config = function()
			require("copilot").setup({
				suggestion = { enabled = true, auto_trigger = true, hide_during_completion = true },
				panel = { enabled = false },
			})
		end,
	}
end

return copilot
