local oil = {}

function oil.config()
	return {
		"stevearc/oil.nvim",
		commit = "b73018b75affd13fa38e2fc94ef753b465f770d7",
		cmd = "Oil",
		-- Keep in sync with plugins/oil/keymaps.lua
		keys = {
			{ "<leader>fo", desc = "Open parent directory" },
		},
		dependencies = {
			require("plugins.nvim-web-devicons").config(),
		},
		config = function()
			require("oil").setup({})
			require("plugins.oil.keymaps").setup()
		end,
	}
end

return oil
