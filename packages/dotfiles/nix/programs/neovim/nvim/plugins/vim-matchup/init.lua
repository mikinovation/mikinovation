local vimMatchup = {}

function vimMatchup.config()
	return {
		"andymass/vim-matchup",
		commit = "0106b1afd4a2f7e1098037b5ceb161bab7471088",
		event = { "BufReadPost", "BufNewFile" },
	}
end

return vimMatchup
