@echo off
call wset.bat
cmd /c sass %INP%/sass/common/style.scss:%OUT%/css/common/style.css --watch