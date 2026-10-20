@echo off
title ShopKart Server
cd /d "%~dp0"

set NODE_EXE=node
if exist ".node\node.exe" set NODE_EXE=.node\node.exe

where %NODE_EXE% >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js nahi mila.
  echo   Install kariye: https://nodejs.org  ^(LTS version^)
  echo.
  pause
  exit /b 1
)

echo.
echo   ShopKart server start ho raha hai...
echo   Browser me kholiye: http://localhost:3000
echo   Band karne ke liye: Ctrl + C
echo.

start "" http://localhost:3000
%NODE_EXE% server.js
pause
