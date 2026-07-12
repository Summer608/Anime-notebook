@echo off
chcp 65001 >nul
title 番剧手帐 - 关闭中

echo 正在关闭番剧手帐网站（端口 5173）...
echo.

:: 查找占用 5173 端口的进程并结束
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo 发现进程 PID: %%a，正在结束...
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo 网站已关闭。
pause
