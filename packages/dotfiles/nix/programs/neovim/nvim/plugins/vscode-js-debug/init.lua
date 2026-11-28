local vscodeJsDebug = {}

function vscodeJsDebug.config()
	return {
		"microsoft/vscode-js-debug",
		branch = "main",
		commit = "03042b33898c3fc8060b04e359cbe294daf86bff",
		build = "npm install --legacy-peer-deps && npm run compile",
	}
end

return vscodeJsDebug
