# Plan de Mejoras y Escalabilidad: AutoProof Check IA

## 1. Propuesta de Arquitectura
Para escalar a un nivel Enterprise, se recomienda la transición de un monolito acoplado a una **Arquitectura Modular Orientada a Servicios**:

- **Refactorización Frontend:** Migrar de Vanilla JS a un framework reactivo (**React.js o Vue.js**) con gestión de estado profesional (**Zustand o Redux Toolkit**). Esto permitirá manejar flujos de inspección complejos sin degradación de rendimiento.
- **Backend Escalable:** Separar el servicio de Análisis de IA del servicio de Generación de Reportes. Implementar una cola de mensajes (**Redis / RabbitMQ**) para procesar PDF pesados de forma asíncrona.
- **Micro-Frontends (Opcional):** Si la flota crece, separar el módulo de "Driver Inspection" del "Fleet Admin Dashboard".

## 2. Estrategia de Datos
La ausencia de persistencia actual es la mayor barrera para la comercialización. Se propone:

- **Base de Datos Relacional (PostgreSQL):** Para gestión de flota (placas, modelos), usuarios (conductores, administradores) e historial de viajes.
- **Base de Datos Documental (MongoDB):** Para almacenar los resultados crudos de las inspecciones de IA, permitiendo flexibilidad en los campos detectados.
- **Object Storage (Google Cloud Storage):** Almacenar evidencias fotográficas y PDFs finales. No usar el sistema de archivos local del servidor.

## 3. Modularización por Componentes (IMPLEMENTADO)

Se ha reorganizado el backend en la carpeta `/backend/app/` siguiendo una arquitectura modular orientada a servicios.

## 4. Deployment & Hosting
- **Frontend:** Despliegue en **Vercel** o **Firebase Hosting** para aprovechar las capacidades de PWA y Service Workers (Offline support).
- **Backend:** **Google Cloud Run** (Serverless Containers). Escala a cero cuando no hay inspecciones, optimizando costos.
- **CDN:** Cloudflare para protección contra ataques DDoS y cacheo de activos estáticos.

## 4. Infraestructura y Servidores
Implementar **Infraestructura como Código (IaC)** mediante Terraform para garantizar entornos idénticos en Desarrollo, Staging y Producción.

- **CI/CD Pipeline:** Configurar GitHub Actions para:
  1. Ejecución de tests automatizados (`pytest` y `vitest`).
  2. Análisis estático de código (SonarQube).
  3. Construcción de imagen Docker y despliegue automático en Cloud Run.
- **Monitoreo:** Integrar **Sentry** para captura de errores en tiempo real y **Datadog** para métricas de latencia de la IA.

## 5. IA Integration Plan (Roadmap)
- **Prompt Engineering Versioning:** Utilizar herramientas como LangSmith para versionar los prompts de inspección y evitar regresiones en la detección.
- **Model Tuning:** Entrenar un adaptador (LoRA) para Gemini 1.5 enfocado específicamente en daños de carrocería y componentes mecánicos específicos.
- **Offline IA:** Explorar **MediaPipe** para validaciones básicas (presencia de llanta, placa) directamente en el dispositivo, reservando Gemini para análisis críticos de profundidad que requieran razonamiento superior.
- **Integración OBD-II Real:** Implementar **Web Bluetooth API** para conectar con escáneres ELM327 y obtener telemetría en tiempo real sin intervención manual.
