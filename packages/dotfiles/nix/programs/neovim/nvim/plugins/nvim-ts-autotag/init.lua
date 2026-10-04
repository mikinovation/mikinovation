local nvimTsAutotag = {}

function nvimTsAutotag.config()
	return {
		"windwp/nvim-ts-autotag",
		branch = "main",
		commit = "d7220b55e16ed3c04e88086256def5d282429493",
		event = "InsertEnter",
		config = true,
	}
end

return nvimTsAutotag
