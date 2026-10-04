local copilot = {}

function copilot.config()
	return {
		"zbirenbaum/copilot.lua",
		commit = "9c8b172570105d31ff707cb0d62897f79c2ddb1f",
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
