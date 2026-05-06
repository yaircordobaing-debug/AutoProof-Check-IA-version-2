@echo off
echo Configurando Flujo Profesional Git (Gitflow)...

:: Asegurar que estamos en main
git checkout -B main

:: Crear develop a partir de main
git checkout -B develop

:: Mostrar ramas creadas
git branch

echo.
echo ====================================================
echo Ramas configuradas. Usa 'git checkout develop' para integracion.
echo Para nuevas funcionalidades usa: git checkout -b feature/nombre-feature develop
echo Para parches urgentes usa: git checkout -b hotfix/nombre-hotfix main
echo ====================================================
echo.
echo Convenciones de Commit activadas mediante hook (feat:, fix:, chore:, etc.)
pause
