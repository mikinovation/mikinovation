local vscodeJsDebug = {}

function vscodeJsDebug.config()
	return {
		"microsoft/vscode-js-debug",
		build = "npm install --legacy-peer-deps && npm run compile",
	}
end

return vscodeJsDebug
