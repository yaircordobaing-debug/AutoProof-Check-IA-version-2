@echo off
echo =======================================
echo    LIMPIANDO PROCESOS EN SEGUNDO PLANO
echo =======================================
echo Deteniendo servidores de Python...
taskkill /F /IM python.exe /T >nul 2>&1
echo Deteniendo servidores de Node (Frontend)...
taskkill /F /IM node.exe /T >nul 2>&1
echo.
echo Todos los procesos antiguos han sido limpiados.
echo Ya puedes volver a ejecutar .\start.bat
echo.
pause
