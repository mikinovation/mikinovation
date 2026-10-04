local yanky = {}

function yanky.config()
	return {
		"gbprod/yanky.nvim",
		commit = "4b4ddd196526fd3d6fd091d931810f9743e936d3",
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
