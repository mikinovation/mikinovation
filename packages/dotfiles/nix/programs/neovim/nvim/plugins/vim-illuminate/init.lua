local vimIlluminate = {}

function vimIlluminate.config()
	return {
		"RRethy/vim-illuminate",
		commit = "1cc33d347c574c3bd21a4852fc9ffed677c1c58c",
		event = { "BufReadPost", "BufNewFile" },
		config = function()
			require("illuminate").configure()
		end,
	}
end

return vimIlluminate
