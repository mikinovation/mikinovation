local vscodeJsDebug = {}

function vscodeJsDebug.config()
	return {
		"microsoft/vscode-js-debug",
		commit = "1c29ecbd305e91e32d8c4eac8daf10ad127f3a6b",
		build = "npm install --legacy-peer-deps && npm run compile",
	}
end

return vscodeJsDebug
