local copilot = {}

function copilot.config()
	return {
		"zbirenbaum/copilot.lua",
		branch = "master",
		commit = "bae5beb4bd902498ba80add63db5a7e7e6ffb4d8",
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
