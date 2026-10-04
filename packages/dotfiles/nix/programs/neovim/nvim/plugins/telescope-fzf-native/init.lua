local telescopeFzfNative = {}

function telescopeFzfNative.config()
	return {
		"nvim-telescope/telescope-fzf-native.nvim",
		branch = "main",
		commit = "b25b749b9db64d375d782094e2b9dce53ad53a40",
		build = "make",
		cond = function()
			return vim.fn.executable("make") == 1
		end,
	}
end

return telescopeFzfNative
