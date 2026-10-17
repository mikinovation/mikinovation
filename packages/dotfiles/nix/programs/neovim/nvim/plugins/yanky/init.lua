local yanky = {}

function yanky.config()
	return {
		"gbprod/yanky.nvim",
		branch = "main",
		commit = "adcabd8512bead30184916fa9277e73c021ef099",
		event = "VeryLazy",
		opts = {},
		config = function()
			require("yanky").setup({
				highlight = {
					timer = 200,
				},
			})
		end,
	}
end

return yanky
