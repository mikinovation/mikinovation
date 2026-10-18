local vscodeJsDebug = {}

function vscodeJsDebug.config()
	return {
		"microsoft/vscode-js-debug",
		branch = "main",
		commit = "49b9128f4b3872ab71fe22d1b97c12dcf7296df3",
		build = "npm install --legacy-peer-deps && npm run compile",
	}
end

return vscodeJsDebug
