-- renovate: datasource=git-refs depName=tpope/vim-rails currentValue=d3954dfe3946c9330dc91b4fbf79ccacb2c626c0
local vimRails = {}

function vimRails.config()
	return {
		"tpope/vim-rails",
		commit = "b0a5c76f86ea214ade36ab0b811e730c3f0add67",
		ft = { "ruby", "eruby", "haml", "slim" },
	}
end

return vimRails
