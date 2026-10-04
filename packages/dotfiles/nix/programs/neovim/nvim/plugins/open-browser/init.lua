local openBrowser = {}

function openBrowser.config()
	return {
		"tyru/open-browser.vim",
		commit = "7d4c1d8198e889d513a030b5a83faa07606bac27",
		-- Keep in sync with plugins/open-browser/keymaps.lua
		keys = {
			{ "gx", desc = "Open URL under cursor" },
			{ "gx", mode = "v", desc = "Open selected URL" },
		},
		config = function()
			require("plugins.open-browser.keymaps").setup()
		end,
	}
end

return openBrowser
