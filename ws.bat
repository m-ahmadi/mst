@echo off
call wset.bat
cmd /c sass %INP%/sass/%CWP%/style.scss:%OUT%/css/%CWP%/style.css --watch