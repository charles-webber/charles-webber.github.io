@echo off
chcp 65001 >nul
title Blog Control Center

:: ========== 可配置：VPS 自动执行 download_bgs.py ==========
:: 请填写你的 VPS 登录信息；留空则跳过自动执行。
set "VPS_HOST=20.239.25.118"   
set "VPS_USER=root"            
set "VPS_PATH=/home/www/blog"  
set "VPS_PYTHON=python3"       
set "SSH_BIN=ssh -p 1145 -i C:\Users\alex\.ssh\id_ed25519_1panel" 
:: ==========================================================
echo ---------------------------------------------------
echo       [ Meting API + Hexo Deployer ]
echo ---------------------------------------------------

:: 1. 检查并启动本地音乐 API (如果端口没占用)
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel%==0 (
    echo [Check] API Server is already running on port 3000.
) else (
    echo [Start] Starting Meting API Server [Invisible Mode]...
    start "" wscript start_meting_hidden.vbs
    echo [ OK  ] API started in background.
)

echo.
echo ===================================================
echo   Current Status:
echo     - Blog URL   : http://blog.wenmozhu.de5.net
echo     - API Server : Running locally (Port 3000)
echo ===================================================
echo.
echo   Options:
echo     [1] New Post (Create a new article)
echo     [2] Deploy (Generate ^& Upload to VPS)
echo     [3] Clean ^& Deploy (Fix weird issues)
echo     [4] Exit
    echo     [5] Start FRP (Serve Public Folder)
    echo     [6] Deploy FRP Server to VPS
    echo.

:menu
set /p choice="Please select [1-6]: "

if "%choice%"=="1" goto new_post
if "%choice%"=="2" goto deploy
if "%choice%"=="3" goto clean_deploy
if "%choice%"=="4" goto exit
if "%choice%"=="5" goto frp_start
if "%choice%"=="6" goto frp_deploy

:deploy
echo [Hexo] Generating static files...
call npx hexo g
if %errorlevel% neq 0 (
    echo [Error] Generation failed!
    pause
    goto menu
)

echo [Hexo] Uploading to VPS...
call npx hexo d
if %errorlevel% neq 0 (
    echo [Error] Deployment failed!
    pause
    goto menu
)
:: 部署成功后，可选执行 VPS 端下载脚本
if "%VPS_HOST%"=="" goto skip_remote_deploy
echo [VPS] Running download_bgs.py on %VPS_HOST% ...
%SSH_BIN% %VPS_USER%@%VPS_HOST% "cd %VPS_PATH% && %VPS_PYTHON% download_bgs.py"
if %errorlevel% neq 0 (
    echo [Warn] Remote download_bgs.py failed or skipped.
) else (
    echo [VPS] download_bgs.py executed.
)
:skip_remote_deploy
echo [Done] Deployment complete!
pause
goto menu

:clean_deploy
echo [Hexo] Cleaning cache...
call npx hexo clean

echo [Hexo] Generating static files...
call npx hexo g
if %errorlevel% neq 0 (
    echo [Error] Generation failed!
    pause
    goto menu
)

echo [Hexo] Uploading to VPS...
call npx hexo d
if %errorlevel% neq 0 (
    echo [Error] Deployment failed!
    pause
    goto menu
)
:: 部署成功后，可选执行 VPS 端下载脚本
if "%VPS_HOST%"=="" goto skip_remote_clean
echo [VPS] Running download_bgs.py on %VPS_HOST% ...
%SSH_BIN% %VPS_USER%@%VPS_HOST% "cd %VPS_PATH% && %VPS_PYTHON% download_bgs.py"
if %errorlevel% neq 0 (
    echo [Warn] Remote download_bgs.py failed or skipped.
) else (
    echo [VPS] download_bgs.py executed.
)
:skip_remote_clean
echo [Done] Clean deployment complete!
pause
goto menu

:frp_start
echo [FRP] Checking configuration...
if not exist "frp\frpc.exe" (
    echo [Error] frpc.exe not found in run directory/frp folder.
    echo Please ensure s:\Blog\frp\frpc.exe exists.
    pause
    goto menu
)
echo [Hexo] Generating static files...
call npx hexo g
if %errorlevel% neq 0 (
    echo [Error] Generation failed!
    pause
    goto menu
)
echo [Server] Starting local Python HTTP server on port 4000...
powershell -Command "Start-Process python -ArgumentList '-m','http.server','4000','--directory','public' -WindowStyle Hidden"
timeout /t 2 >nul

echo [FRP] Starting Tunnel...
echo [Info] Serving 'public' folder via VPS. Press Ctrl+C to stop.
frp\frpc.exe -c frp\frpc.toml
echo [Cleanup] Stopping background Python server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>&1
pause
goto menu

:frp_deploy
echo [FRP] Deploying FRP Server to VPS...
if not exist "frp\setup_frps.bat" (
    echo [Error] setup_frps.bat not found!
    pause
    goto menu
)
call frp\setup_frps.bat
goto menu

:new_post
set /p slug="Enter post filename (e.g. My-Life): "
call npx hexo new post "%slug%"
echo Created s:\Blog\source\_posts\%slug%.md
goto menu

:exit
echo Closing...
timeout /t 2 >nul
exit
