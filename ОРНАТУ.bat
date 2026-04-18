@echo off
chcp 65001 >nul
title Analytical Dashboard — Орнату

echo.
echo ============================================
echo    Analytical Dashboard — Орнату
echo ============================================
echo.

echo [0/5] Барлық Node процестерін тоқтату...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo    [OK] Процестер тоқтатылды

echo [1/5] Node.js тексерілуде...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    [ҚАТЕ] Node.js табылмады!
    echo    nodejs.org сайтынан жүктеп алыңыз.
    pause & exit /b 1
)
for /f %%i in ('node --version') do echo    [OK] Node.js %%i

echo [2/5] npm тәуелділіктері орнатылуда...
call npm install
if %errorlevel% neq 0 ( echo    [ҚАТЕ] npm install & pause & exit /b 1 )
echo    [OK] npm дайын

echo [3/5] Дерекқор файлы жасалуда...
call npx prisma generate
if %errorlevel% neq 0 ( echo    [ҚАТЕ] Prisma generate & pause & exit /b 1 )
call npx prisma db push
if %errorlevel% neq 0 ( echo    [ҚАТЕ] Prisma db push & pause & exit /b 1 )
echo    [OK] Дерекқор дайын

echo [4/5] Default аккаунт жасалуда...
call node prisma/seed.js
if %errorlevel% neq 0 ( echo    [ЕСКЕРТУ] Seed қатесі, бірақ жалғасамыз... )
echo    [OK] Аккаунт тексерілді

echo [5/5] Орнату аяқталды!

echo.
echo ============================================
echo    ОРНАТУ АЯҚТАЛДЫ!
echo ============================================
echo.
echo  Кіру деректері:
echo    Email:   admin@dashboard.com
echo    Пароль:  admin1234
echo.
echo  Енді ІСКЕ_ҚОСУ.bat файлын ашыңыз
echo.
pause
