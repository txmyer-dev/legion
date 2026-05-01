Set WshShell = CreateObject("WScript.Shell")
' Run the node process invisibly (0 window style)
WshShell.Run "cmd /c bun run index.ts node", 0
Set WshShell = Nothing
