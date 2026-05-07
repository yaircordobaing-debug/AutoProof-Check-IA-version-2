@echo off
echo Preparando actualizacion para subir a GitHub...

:: Añadir todos los cambios
git add .

:: Crear un commit descriptivo que notifique al equipo
git commit -m "feat: Integrar auth mock DB, autocompletado en accidentes y desacoplar IA" -m "Detalles de la actualizacion:" -m "- Implementación de Base de Datos relacional simulada (mock_database.json) con 15 conductores y vehículos." -m "- Login funcional conectado a datos simulados y carga de Dashboard/Perfil/Panel dinámicos." -m "- Modulo 'Reportar Accidente' optimizado con autocompletado de datos del conductor y validación GPS real." -m "- Desactivado temporalmente el motor de IA en ia_service.py para facilitar despliegue y pruebas sin API keys."

:: Subir a la rama actual en GitHub
echo Subiendo cambios al repositorio remoto...
git push origin HEAD

echo.
echo ====================================================
echo Actualizacion subida exitosamente.
echo El equipo ha sido notificado mediante este commit.
echo ====================================================
pause
