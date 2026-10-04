local packageInfo = {}

function packageInfo.config()
	return {
		"vuki656/package-info.nvim",
		commit = "b86cf49efc3855dd94afb33304b278f6f122bf1a",
		ft = "json",
		dependencies = {
			require("plugins.nui").config(),
		},
		config = function()
			require("package-info").setup()
			require("plugins.package-info.keymaps").setup()
		end,
	}
end

return packageInfo
