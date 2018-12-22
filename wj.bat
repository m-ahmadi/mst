@echo off
call wset.bat
cmd /c babel %INP%/js/ -d %OUT%/js/ -s -w