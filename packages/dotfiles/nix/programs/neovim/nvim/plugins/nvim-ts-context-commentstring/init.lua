local nvimTsContextCommentstring = {}

function nvimTsContextCommentstring.config()
	return {
		"JoosepAlviste/nvim-ts-context-commentstring",
		branch = "main",
		commit = "6141a40173c6efa98242dc951ed4b6f892c97027",
		-- Loaded on demand as a dependency of Comment.nvim
		lazy = true,
		config = function()
			require("ts_context_commentstring").setup({
				enable_autocmd = false,
			})
		end,
	}
end

return nvimTsContextCommentstring
