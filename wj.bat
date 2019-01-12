@echo off
call wset.bat
cmd /c babel %INP%/js/%CWP%/ -d %OUT%/js/%CWP%/ -s -w