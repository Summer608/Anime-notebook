@echo off
cd /d "%~dp0"
chcp 65001 >nul 2>&1

title 番剧手帐 - 启动中

echo ==========================================
echo    番剧手帐 - 本地动漫收藏网站
echo ==========================================
echo.

:: 设置 Node.js 路径
set "NODE_DIR=%USERPROFILE%\.local\nodejs\node-v22.15.0-win-x64"

if not exist "%NODE_DIR%\node.exe" (
    echo [错误] 没有找到 Node.js。
    echo.
    echo 解决方法：
    echo 1. 访问 https://nodejs.org/zh-cn/download/
    echo 2. 下载并安装 LTS 版本
    echo 3. 重新运行 start.bat
    echo.
    pause
    exit /b 1
)

echo [信息] 使用 Node.js: %NODE_DIR%
set "PATH=%NODE_DIR%;%PATH%"
node -v
npm -v
echo.

:: 安装依赖（首次运行）
if not exist "node_modules" (
    echo [信息] 首次运行，正在安装依赖，请稍候...
    npm install
    if errorlevel 1 (
        echo.
        echo [错误] 依赖安装失败，请检查网络连接。
        pause
        exit /b 1
    )
    echo.
)

echo [信息] 正在启动网站...
echo [信息] 启动成功后，请打开浏览器访问：http://localhost:5173/
echo [信息] 关闭网站：在此窗口按 Ctrl + C，然后关闭窗口
echo.

npm run dev

echo.
echo [信息] 网站已停止运行。
pause
