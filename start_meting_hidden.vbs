Set WshShell = CreateObject("WScript.Shell") 
WshShell.Run "cmd /c cd local-meting && node app.js", 0
Set WshShell = Nothing 