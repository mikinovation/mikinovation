-- plugins.lua
-- Bootstraps lazy.nvim and lists the plugin specs of the full profile.
-- The minimal profile passes its own subset of specs to M.setup.

-- Plugin versions are pinned by the `commit` field of each spec, not by a
-- lockfile. lazy.nvim itself is pinned here so the bootstrap matches the spec.
local LAZY_COMMIT = "306a05526ada86a7b30af95c5cc81ffba93fef97"

local M = {}

--- Bootstrap lazy.nvim and set up the given plugin specs.
--- @param specs table[] lazy.nvim specs
function M.setup(specs)
	local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
	if not (vim.uv or vim.loop).fs_stat(lazypath) then
		local lazyrepo = "https://github.com/folke/lazy.nvim.git"
		local out = vim.fn.system({ "git", "clone", "--filter=blob:none", lazyrepo, lazypath })
		if vim.v.shell_error == 0 then
			out = vim.fn.system({ "git", "-C", lazypath, "checkout", LAZY_COMMIT })
		end
		if vim.v.shell_error ~= 0 then
			error("Error cloning lazy.nvim:\n" .. out)
		end
	end ---@diagnostic disable-next-line: undefined-field

	vim.opt.rtp:prepend(lazypath)

	require("lazy").setup(vim.list_extend({ { "folke/lazy.nvim", commit = LAZY_COMMIT } }, specs), {
		-- lazy.nvim always writes a lockfile. Keep it out of the read-only config
		-- directory and the repository; the specs are the source of truth.
		lockfile = vim.fn.stdpath("state") .. "/lazy-lock.json",
		performance = {
			rtp = {
				-- Built-in runtime plugins that are never used
				disabled_plugins = {
					"gzip",
					"tarPlugin",
					"zipPlugin",
					"tohtml",
					"tutor",
					"rplugin",
					"netrwPlugin",
				},
			},
		},
		ui = {
			icons = vim.g.have_nerd_font and {} or {
				cmd = "⌘",
				config = "🛠",
				event = "📅",
				ft = "📂",
				init = "⚙",
				keys = "🗝",
				plugin = "🔌",
				runtime = "💻",
				require = "🌙",
				source = "📄",
				start = "🚀",
				task = "📌",
				lazy = "💤 ",
			},
		},
	})
end

--- Plugin specs of the full profile.
--- @return table[]
function M.full_specs()
	return {
		require("plugins.blink-cmp").config(),
		require("plugins.comment").config(),
		require("plugins.copilot").config(),
		require("plugins.diffview").config(),
		require("plugins.dropbar").config(),
		require("plugins.git-conflict").config(),
		require("plugins.gitlinker").config(),
		require("plugins.gitsigns").config(),
		require("plugins.indent-blankline").config(),
		require("plugins.lazydev").config(),
		require("plugins.lualine").config(),
		require("plugins.markdown-preview").config(),
		require("plugins.nvim-tree").config(),
		require("plugins.neogit").config(),
		require("plugins.neotest").config(),
		require("plugins.none-ls").config(),
		require("plugins.nvim-autopairs").config(),
		require("plugins.nvim-bqf").config(),
		require("plugins.nvim-colorizer").config(),
		require("plugins.nvim-context-vt").config(),
		require("plugins.nvim-dap").config(),
		require("plugins.nvim-dbee").config(),
		require("plugins.nvim-notify").config(),
		require("plugins.nvim-treesitter-context").config(),
		require("plugins.nvim-treesitter").config(),
		require("plugins.nvim-ts-autotag").config(),
		require("plugins.nvim-ts-context-commentstring").config(),
		require("plugins.octo").config(),
		require("plugins.orgmode").config(),
		require("plugins.org-bullets").config(),
		require("plugins.org-roam").config(),
		require("plugins.package-info").config(),
		require("plugins.pathtool").config(),
		require("plugins.rest").config(),
		require("plugins.sidekick").config(),
		require("plugins.telescope").config(),
		require("plugins.todo-comments").config(),
		require("plugins.toggleterm").config(),
		require("plugins.tokyonight").config(),
		require("plugins.tsc").config(),
		require("plugins.vim-argwrap").config(),
		require("plugins.vim-bundler").config(),
		require("plugins.vim-fugitive").config(),
		require("plugins.vim-illuminate").config(),
		require("plugins.vim-matchup").config(),
		require("plugins.quick-scope").config(),
		require("plugins.vim-rails").config(),
		require("plugins.vim-sleuth").config(),
		require("plugins.which-key").config(),
		require("plugins.yanky").config(),
		require("plugins.open-browser").config(),
		require("plugins.oil").config(),
	}
end

return M
