@echo off
chcp 65001 >nul
title Analytical Dashboard

echo.
echo  Analytical Dashboard іске қосылуда...
echo.

:: Браузерді 4 секундтан кейін ашу
start "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000"

echo  Сервер қосылды: http://localhost:3000
echo  Тоқтату үшін: Ctrl+C
echo.
call npm run dev
