# AutoProof Check IA - Modular Backend

Esta es la nueva arquitectura modular orientada a servicios para escala Enterprise.

## Estructura de Archivos

- `app/main.py`: Punto de entrada principal.
- `app/api/routes/`: Definición de endpoints (análisis, reportes).
- `app/services/`: Lógica de negocio (IA Service, PDF Service).
- `app/models/`: Esquemas de datos Pydantic.
- `app/config/`: Configuración global y gestión de IA.

## Cómo Ejecutar

Para iniciar el servidor con la nueva estructura:

```bash
uvicorn backend.app.main:app --reload
```

## Ventajas
- **Mantenibilidad:** Cada archivo tiene una única responsabilidad.
- **Escalabilidad:** Los servicios de IA y PDF están desacoplados de las rutas.
- **Facilidad de Actualización:** Puedes modificar la lógica de la IA sin tocar los endpoints o la generación de reportes.
