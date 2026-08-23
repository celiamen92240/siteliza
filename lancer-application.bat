@echo off
title Bebe Liza et Clement - Application Grossesse et Jeux
echo ========================================================
echo   Lancement de l'application Bebe Liza et Clement 🎀
echo ========================================================
echo.

set "PATH=C:\Program Files\nodejs;%PATH%"

echo 1. Demarrage du serveur Backend (Port 4000)...
start "Backend Bebe Liza" cmd /k "cd backend && node server.js"

timeout /t 2 /nobreak >nul

echo 2. Demarrage du Frontend React (Port 3000)...
start "Frontend Bebe Liza" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo 3. Ouverture de votre navigateur...
start http://localhost:3000

echo.
echo Application lancee avec succes !
echo Vous pouvez fermer cette fenetre (les serveurs tournent en arriere-plan).
echo ========================================================
pause
