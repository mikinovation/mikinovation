local copilot = {}

function copilot.config()
	return {
		"zbirenbaum/copilot.lua",
		branch = "master",
		commit = "891bb2fda9595307e762cead6a2b7dc2f4076c37",
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
