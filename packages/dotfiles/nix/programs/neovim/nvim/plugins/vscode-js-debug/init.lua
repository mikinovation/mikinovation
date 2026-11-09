local vscodeJsDebug = {}

function vscodeJsDebug.config()
	return {
		"microsoft/vscode-js-debug",
		branch = "main",
		commit = "9b647e82930b1b4b0a4a54d1c607da28c6e468b1",
		build = "npm install --legacy-peer-deps && npm run compile",
	}
end

return vscodeJsDebug
