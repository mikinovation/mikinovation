local nvimAutopairs = {}

function nvimAutopairs.config()
	return {
		"windwp/nvim-autopairs",
		branch = "master",
		commit = "3172f40c16563db871a58f20d205c710ad782311",
		event = "InsertEnter",
		config = true,
	}
end

return nvimAutopairs
