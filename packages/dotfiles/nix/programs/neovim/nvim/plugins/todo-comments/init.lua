local todoComments = {}

function todoComments.config()
	return { -- You can easily change to a different colorscheme.
		"folke/todo-comments.nvim",
		branch = "main",
		commit = "31e3c38ce9b29781e4422fc0322eb0a21f4e8668",
		event = "VimEnter",
		dependencies = {
			require("plugins.plenary").config(),
		},
		opts = { signs = false },
	}
end

return todoComments
