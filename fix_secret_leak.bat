@echo off
echo Preparando fix de seguridad para subir a GitHub...

:: Añadir todos los cambios
git add .

:: Crear un commit de fix para remover el secreto
git commit -m "fix: remover credenciales SMTP hardcodeadas por seguridad"

:: Subir a la rama actual en GitHub
echo Subiendo cambios al repositorio remoto...
git push origin HEAD

echo.
echo ====================================================
echo Fix de seguridad subido exitosamente.
echo IMPORTANTE: Ve a tu cuenta de Google y REVOCA la contrasena
echo de aplicacion expuesta inmediatamente (jzzsbhryddtugtdb).
echo ====================================================
pause
