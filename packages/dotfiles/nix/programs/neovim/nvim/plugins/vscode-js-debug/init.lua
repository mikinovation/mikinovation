local vscodeJsDebug = {}

function vscodeJsDebug.config()
	return {
		"microsoft/vscode-js-debug",
		branch = "main",
		commit = "60db540b297ec51c944fd6753fe9f2cf0fdd8667",
		build = "npm install --legacy-peer-deps && npm run compile",
	}
end

return vscodeJsDebug
