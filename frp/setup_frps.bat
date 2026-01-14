@echo off
chcp 65001 >nul
title FRP Server 一键部署到 VPS

:: ================================================================
:: 本地触发脚本：上传配置并在 VPS 执行部署
:: ================================================================

:: VPS 配置 (与 run.bat 保持一致)
set "VPS_HOST=20.239.25.118"
set "VPS_USER=root"
set "VPS_PORT=1145"
set "SSH_KEY=C:\Users\alex\.ssh\id_ed25519_1panel"
set "FRP_REMOTE_DIR=/home/frp"

:: 本地文件路径
set "LOCAL_DIR=%~dp0"

echo ===================================================
echo    FRP Server 一键部署到 VPS
echo ===================================================
echo.
echo VPS: %VPS_USER%@%VPS_HOST%:%VPS_PORT%
echo 远程目录: %FRP_REMOTE_DIR%
echo.

:: 1. 检查本地文件
echo [1/4] 检查本地文件...
if not exist "%LOCAL_DIR%frps.toml" (
    echo [Error] frps.toml 不存在！
    pause
    exit /b 1
)
if not exist "%LOCAL_DIR%frps.service" (
    echo [Error] frps.service 不存在！
    pause
    exit /b 1
)
if not exist "%LOCAL_DIR%deploy_frps.sh" (
    echo [Error] deploy_frps.sh 不存在！
    pause
    exit /b 1
)
echo [OK] 本地文件检查通过

:: 2. 创建远程目录
echo.
echo [2/4] 确保远程目录存在...
ssh -p %VPS_PORT% -i "%SSH_KEY%" %VPS_USER%@%VPS_HOST% "mkdir -p %FRP_REMOTE_DIR%"
if %errorlevel% neq 0 (
    echo [Error] SSH 连接失败！请检查网络或密钥配置。
    pause
    exit /b 1
)
echo [OK] 远程目录已就绪

:: 3. 上传配置文件
echo.
echo [3/4] 上传配置文件...
scp -P %VPS_PORT% -i "%SSH_KEY%" "%LOCAL_DIR%frps.toml" %VPS_USER%@%VPS_HOST%:%FRP_REMOTE_DIR%/frps.toml
scp -P %VPS_PORT% -i "%SSH_KEY%" "%LOCAL_DIR%frps.service" %VPS_USER%@%VPS_HOST%:%FRP_REMOTE_DIR%/frps.service
scp -P %VPS_PORT% -i "%SSH_KEY%" "%LOCAL_DIR%deploy_frps.sh" %VPS_USER%@%VPS_HOST%:%FRP_REMOTE_DIR%/deploy_frps.sh
if %errorlevel% neq 0 (
    echo [Error] 文件上传失败！
    pause
    exit /b 1
)
echo [OK] 配置文件已上传

:: 4. 执行远程部署脚本
echo.
echo [4/4] 执行远程部署脚本...
echo ---------------------------------------------------
ssh -p %VPS_PORT% -i "%SSH_KEY%" %VPS_USER%@%VPS_HOST% "chmod +x %FRP_REMOTE_DIR%/deploy_frps.sh && %FRP_REMOTE_DIR%/deploy_frps.sh"
echo ---------------------------------------------------

if %errorlevel%==0 (
    echo.
    echo ===================================================
    echo    部署完成！
    echo ===================================================
    echo.
    echo 现在你可以：
    echo   1. 访问 Dashboard: http://%VPS_HOST%:7500
    echo   2. 在本地运行 run.bat 选择 [5] 启动 FRP
    echo   3. 访问博客: http://%VPS_HOST%:6000
    echo.
) else (
    echo.
    echo [Error] 部署过程中出现错误，请检查输出信息。
)

pause
