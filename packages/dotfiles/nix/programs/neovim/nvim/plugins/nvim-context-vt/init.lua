local nvimContextVt = {}

function nvimContextVt.config()
	return {
		"andersevenrud/nvim_context_vt",
		commit = "74c5ec8786426c5458e1a9f6b8b2fd6977ba01ab",
		event = { "BufReadPost", "BufNewFile" },
		config = function()
			require("nvim_context_vt").setup()
		end,
	}
end

return nvimContextVt
