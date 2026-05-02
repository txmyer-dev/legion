Set FSO = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")
' Set the working directory to the project root
WshShell.CurrentDirectory = FSO.GetParentFolderName(FSO.GetParentFolderName(WScript.ScriptFullName))

' Run the node process invisibly (0 window style) and log output for debugging
WshShell.Run "cmd /c bun run src/index.ts node ws://34.23.56.47:9090 > node.log 2>&1", 0

Set WshShell = Nothing
Set FSO = Nothing
