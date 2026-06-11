@echo off
chcp 65001 >nul
title 四年级信息科技期末考试系统

echo ========================================
echo   四年级信息科技期末考试系统
echo ========================================
echo.

:: Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo [1/3] 检查依赖...
if not exist "node_modules" (
    echo 正在安装依赖，请稍候...
    call npm install
)

echo [2/3] 构建前端...
call npx vite build
if %ERRORLEVEL% neq 0 (
    echo [错误] 前端构建失败
    pause
    exit /b 1
)

echo [3/3] 启动服务器...
echo.
echo ========================================
echo   服务器启动中...
echo   学生考试地址: http://localhost:3000
echo   教师管理地址: http://localhost:3000/admin
echo ========================================
echo.
echo 按 Ctrl+C 停止服务器
echo.

call npx tsx server.ts

pause
