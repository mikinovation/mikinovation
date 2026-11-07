local yanky = {}

function yanky.config()
	return {
		"gbprod/yanky.nvim",
		branch = "main",
		commit = "edcbe0f6d693b9e7860626094f886a2d79cfe63b",
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
