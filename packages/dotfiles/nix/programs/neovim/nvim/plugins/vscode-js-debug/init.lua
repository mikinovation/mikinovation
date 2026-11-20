local vscodeJsDebug = {}

function vscodeJsDebug.config()
	return {
		"microsoft/vscode-js-debug",
		branch = "main",
		commit = "026dfbc0a30ea5a531030095e9307e664b3b7310",
		build = "npm install --legacy-peer-deps && npm run compile",
	}
end

return vscodeJsDebug
