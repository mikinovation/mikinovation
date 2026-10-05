local orgmode = {}

function orgmode.config()
	return {
		"nvim-orgmode/orgmode",
		branch = "master",
		commit = "2f650b2fa0dc80d399093d35fb25232f96ad16d6",
		event = "VeryLazy",
		config = function()
			local workflow = require("plugins.orgmode.workflow")

			require("orgmode").setup({
				org_todo_keywords = workflow.todo_keywords,
				org_todo_keyword_faces = workflow.todo_keyword_faces,
				org_agenda_files = workflow.agenda_files,
				org_agenda_custom_commands = workflow.agenda_custom_commands,
				mappings = {
					org = {
						-- Replaced by plugins.orgmode.actions.pick_todo_state; cycling
						-- through 11 states one key press at a time is not usable.
						org_todo = false,
						org_todo_prev = false,
					},
				},
			})

			require("plugins.orgmode.keymaps").setup()
		end,
	}
end

return orgmode
