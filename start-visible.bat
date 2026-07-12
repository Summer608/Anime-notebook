@echo off
cd /d "%~dp0"
chcp 65001 >nul 2>&1

set "NODE_DIR=%USERPROFILE%\.local\nodejs\node-v22.15.0-win-x64"
if not exist "%NODE_DIR%\node.exe" (
    for /d %%D in ("%USERPROFILE%\.local\nodejs\node-v*") do (
        if exist "%%D\node.exe" set "NODE_DIR=%%D"
    )
)

if not exist "%NODE_DIR%\node.exe" (
    echo [Error] Node.js not found.
    echo Please install Node.js LTS from https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies for the first time...
    start "Install Dependencies" cmd /k "set PATH=%NODE_DIR%;%PATH% && cd /d %CD% && npm install && echo Done && pause"
    exit /b
)

echo Starting Anime Notebook...
echo A new window will open. Do not close it.
echo Open browser: http://localhost:5173/
start "Anime Notebook" cmd /k "set PATH=%NODE_DIR%;%PATH% && cd /d %CD% && npm run dev"
