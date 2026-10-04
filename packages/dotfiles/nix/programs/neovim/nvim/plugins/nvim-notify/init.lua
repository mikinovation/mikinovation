local nvimNotify = {}

function nvimNotify.config()
	return {
		"rcarriga/nvim-notify",
		branch = "master",
		commit = "8701bece920b38ea289b457f902e2ad184131a5d",
		event = "VeryLazy",
		config = function()
			local notify = require("notify")
			notify.setup({
				stages = "fade_in_slide_out",
				timeout = 5000,
				highlight = "Normal",
				icons = {
					ERROR = "",
					WARN = "",
					INFO = "",
					DEBUG = "",
					TRACE = "✎",
				},
			})
			vim.notify = notify
		end,
	}
end

return nvimNotify
