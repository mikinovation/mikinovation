local diffview = {}

function diffview.config()
	return {
		"sindrets/diffview.nvim",
		commit = "4516612fe98ff56ae0415a259ff6361a89419b0a",
		cmd = {
			"DiffviewOpen",
			"DiffviewClose",
			"DiffviewFileHistory",
			"DiffviewToggleFiles",
			"DiffviewFocusFiles",
			"DiffviewRefresh",
		},
		-- Keep in sync with plugins/diffview/keymaps.lua
		keys = {
			{ "<leader>dvo", desc = "Diffview Open" },
			{ "<leader>dvh", desc = "Diffview File History" },
			{ "<leader>dvf", desc = "Diffview Current File History" },
		},
		config = function()
			require("diffview").setup({})
			require("plugins.diffview.keymaps").setup()
		end,
	}
end

return diffview
