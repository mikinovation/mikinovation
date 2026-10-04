local tsc = {}

function tsc.config()
	return {
		"dmmulroy/tsc.nvim",
		commit = "e083bcf1e54bc3af7df92b33235efb334e8c782c",
		cmd = { "TSC", "TSCOpen", "TSCClose", "TSCStop" },
		config = function()
			require("tsc").setup({})
		end,
	}
end

return tsc
