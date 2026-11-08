local copilot = {}

function copilot.config()
	return {
		"zbirenbaum/copilot.lua",
		branch = "master",
		commit = "1d674b416df08e5c54e442503b7703a0df462acf",
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
