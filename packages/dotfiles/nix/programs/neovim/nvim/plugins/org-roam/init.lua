local orgRoam = {}

local ROAM_DIRECTORY = "~/ghq/github.com/mikinovation/mikinovation/roam"

function orgRoam.config()
	return {
		"chipsenkbeil/org-roam.nvim",
		-- renovate: tag=0.2.0
		commit = "34d1d113cd139ea903125305310be3d7c1067484",
		dependencies = {
			"nvim-orgmode/orgmode",
		},
		event = "VeryLazy",
		config = function()
			require("org-roam").setup({
				directory = ROAM_DIRECTORY,
				org_files = {
					"~/ghq/github.com/mikinovation/org",
				},
				templates = {
					d = {
						description = "default",
						template = table.concat({
							"#+begin_src yaml",
							"type:",
							"description:",
							"tags: []",
							"timestamp: %<%Y-%m-%dT%H:%M:%S%z>",
							"#+end_src",
							"",
							"%?",
						}, "\n"),
						target = "%<%Y%m%d%H%M%S>-%[slug].org",
					},
				},
			})
			-- The untagged-notes picker needs telescope, which the minimal profile
			-- does not install.
			if require("lazy.core.config").plugins["telescope.nvim"] then
				require("plugins.org-roam.keymaps").setup(ROAM_DIRECTORY)
			end
		end,
	}
end

return orgRoam
