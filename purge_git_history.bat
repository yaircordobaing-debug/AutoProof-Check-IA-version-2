@echo off
echo ====================================================
echo PURGANDO CREDENCIALES DEL HISTORIAL DE GITHUB
echo ====================================================
echo Este script eliminara el commit defectuoso (e60b789)
echo del historial de tu repositorio y lo reemplazara por
echo uno limpio, sin las contrasenas.
echo.
pause

:: Retrocede el historial justo antes del commit defectuoso,
:: pero MANTIENE todos los archivos actuales intactos (incluyendo la correccion de seguridad).
git reset --soft e60b789~1

:: Crea un nuevo commit unificado y limpio
git commit -m "feat: implementar modulo de accidentes y panel (historial limpio)"

:: Fuerza la subida a GitHub para reescribir el historial
echo.
echo Forzando la reescritura del historial en GitHub...
git push origin HEAD --force

echo.
echo ====================================================
echo ¡Historial purgado con exito!
echo.
echo Importante:
echo 1. Si GitGuardian te sigue mostrando la alerta en su web,
echo    solo debes hacer clic en "Resolve" o "Ignore" e indicar
echo    que la contrasena ya fue revocada/eliminada.
echo 2. NO OLVIDES cambiar esa contrasena en tu cuenta de Google.
echo ====================================================
pause
