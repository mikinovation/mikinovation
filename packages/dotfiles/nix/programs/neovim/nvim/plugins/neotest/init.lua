local neotest = {}

function neotest.config()
	return {
		"nvim-neotest/neotest",
		branch = "master",
		commit = "27bf921498043f7ecd821d6db68d05de244bbd02",
		-- Keep in sync with plugins/neotest/keymaps.lua
		keys = {
			{ "<leader>tn", desc = "Run test nearest" },
			{ "<leader>tD", desc = "Debug test nearest (DAP)" },
			{ "<leader>tf", desc = "Run test file" },
		},
		dependencies = {
			require("plugins.nvim-nio").config(),
			require("plugins.plenary").config(),
			require("plugins.fixcursorhold").config(),
			require("plugins.nvim-treesitter").config(),
			require("plugins.neotest-rust").config(),
			require("plugins.neotest-vitest").config(),
		},
		config = function()
			require("neotest").setup({
				adapters = {
					require("neotest-rust"),
					require("neotest-vitest"),
				},
			})

			require("plugins.neotest.keymaps").setup()
		end,
	}
end

return neotest
