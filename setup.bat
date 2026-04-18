@echo off
chcp 65001 >nul
title Analytical Dashboard — Орнату

echo.
echo ============================================
echo    Analytical Dashboard — Setup
echo ============================================
echo.

:: --------------------------------------------------
:: 1. Node.js тексеру
:: --------------------------------------------------
echo [1/6] Node.js тексерілуде...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    [ҚАТЕ] Node.js табылмады!
    echo    https://nodejs.org сайтынан жүктеп алыңыз.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo    [OK] Node.js: %%i

:: --------------------------------------------------
:: 2. Docker тексеру
:: --------------------------------------------------
echo [2/6] Docker тексерілуде...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    [ҚАТЕ] Docker табылмады!
    echo    https://docs.docker.com/desktop/windows/ сайтынан жүктеп алыңыз.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('docker --version') do echo    [OK] %%i

:: --------------------------------------------------
:: 3. .env файлы жасау
:: --------------------------------------------------
echo [3/6] .env файлы тексерілуде...
if exist ".env" (
    echo    [OK] .env файлы бар, өзгертілмейді.
) else (
    echo    .env файлы жасалуда...
    (
        echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/analytical_dashboard?schema=public"
        echo NEXTAUTH_SECRET="setup-secret-please-change-this-to-a-random-64-char-string"
        echo NEXTAUTH_URL="http://localhost:3000"
    ) > .env
    echo    [OK] .env файлы жасалды.
    echo.
    echo    [!] МАҢЫЗДЫ: .env файлын ашып NEXTAUTH_SECRET мәнін
    echo        кездейсоқ ұзын жолға ауыстырыңыз!
    echo.
)

:: --------------------------------------------------
:: 4. npm install
:: --------------------------------------------------
echo [4/6] npm тәуелділіктері орнатылуда...
call npm install
if %errorlevel% neq 0 (
    echo    [ҚАТЕ] npm install сәтсіз аяқталды.
    pause
    exit /b 1
)
echo    [OK] npm тәуелділіктері орнатылды.

:: --------------------------------------------------
:: 5. Docker PostgreSQL
:: --------------------------------------------------
echo [5/6] PostgreSQL контейнері іске қосылуда...
docker-compose up -d
if %errorlevel% neq 0 (
    echo    [ҚАТЕ] Docker Compose сәтсіз аяқталды.
    echo    Docker Desktop іске қосылғанын тексеріңіз.
    pause
    exit /b 1
)
echo    [OK] PostgreSQL іске қосылды.
echo    Дерекқор дайын болуы үшін 3 секунд күтіледі...
timeout /t 3 /nobreak >nul

:: --------------------------------------------------
:: 6. Prisma
:: --------------------------------------------------
echo [6/6] Дерекқор баптауы...
call npx prisma generate
if %errorlevel% neq 0 (
    echo    [ҚАТЕ] Prisma generate сәтсіз.
    pause
    exit /b 1
)
call npx prisma db push
if %errorlevel% neq 0 (
    echo    [ҚАТЕ] Prisma db push сәтсіз.
    echo    Docker жұмыс істеп тұр ма?
    pause
    exit /b 1
)
echo    [OK] Дерекқор дайын.

:: --------------------------------------------------
:: Аяқталды
:: --------------------------------------------------
echo.
echo ============================================
echo    Орнату сәтті аяқталды!
echo ============================================
echo.
echo  Қосымшаны іске қосу:
echo     npm run dev
echo.
echo  Браузерде ашыңыз:
echo     http://localhost:3000
echo.
echo  Бірінші рет жаңа аккаунт тіркеңіз.
echo.
pause
