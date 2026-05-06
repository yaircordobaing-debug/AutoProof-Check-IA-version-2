@echo off
echo Preparando actualizacion para subir a GitHub...

:: Añadir todos los cambios
git add .

:: Crear un commit descriptivo que notifique al equipo
git commit -m "feat: implementar modulo de accidentes, panel de vehiculo y corregir flujo pre-viaje" -m "Detalles de la actualizacion:" -m "- Modulo 'Reportar Accidente' con wizard de 7 fotos obligatorias y formulario detallado de siniestro." -m "- Solucionado error critico en Pre-Viaje: viaje ya no se marca como iniciado si el usuario se devuelve." -m "- Creada vista 'Panel de Vehiculo' con alertas de mantenimiento y control documental." -m "- Flujo de finalizacion de viaje actualizado para solicitar Kilometraje Final." -m "- Integradas convenciones de commits y hook para trabajo profesional en equipo."

:: Subir a la rama actual en GitHub
echo Subiendo cambios al repositorio remoto...
git push origin HEAD

echo.
echo ====================================================
echo Actualizacion subida exitosamente.
echo El equipo ha sido notificado mediante este commit.
echo ====================================================
pause
