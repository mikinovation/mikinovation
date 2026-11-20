local copilot = {}

function copilot.config()
	return {
		"zbirenbaum/copilot.lua",
		branch = "master",
		commit = "ba6c1c7e7b2b6b0a93838097bd09c7c83afa30d3",
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
