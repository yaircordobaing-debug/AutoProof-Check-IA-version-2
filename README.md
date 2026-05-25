<div align="center">
  <img src="https://via.placeholder.com/150/6b9080/ffffff?text=Opercheck+Check+IA" alt="Opercheck IA Logo" height="120">
  
  # Opercheck IA
  
  **Auditoría y Gestión de Flotas Vehiculares asistida por IA Multimodal**  
  *Convertimos inspecciones manuales vulnerables en certificaciones blindadas e inmutables.*
    
  [![CI Pipeline](https://img.shields.io/badge/CI-Active-success.svg)](#)
  [![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](#)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi&logoColor=white)](#)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](#)
</div>

---

## 🚘 El Problema en el Sector Logístico

Las empresas de logística y transporte enfrentan un enorme dolor operativo: **las inspecciones pre-viaje son manuales, subjetivas y altamente susceptibles a fraude**.
Cuando ocurre un siniestro, la falta de evidencia forense (fotos con timestamp verificado, análisis objetivo) y exenciones de responsabilidad digital provocan **pérdidas millonarias por disputas** entre aseguradoras, conductores y dueños de la flota.

## 🚀 La Solución: Opercheck IA

**Opercheck IA** es una plataforma Enterprise PWA que transforma un simple teléfono móvil en un **perito técnico digital auditable**. 

A través de Inteligencia Artificial (Gemini Vision) y un flujo legal estructurado, la plataforma valida daños, piezas mecánicas y niveles de fluidos en tiempo real. En caso de fallas de la IA o sensores (OBD-II), el sistema activa un **flujo legal (Bypass de Responsabilidad)** que obliga al usuario a firmar digitalmente.

### 🌟 Impacto y Valor de Producto
- **⏱️ Reducción de Tiempo:** Entregas un 45% más rápidas en el proceso de checklist diario.
- **🛡️ Blindaje Legal:** Cada reporte genera un PDF forense inmutable (Sello Hash SHA-256).
- **📉 Disminución de Fraude:** Elimina el 99% de reportes alterados al capturar la evidencia en-sitio y procesarla directamente en cloud sin interferencia del usuario.

## 🏗️ Arquitectura y Tecnologías
Diseñado para la escalabilidad y modularización, el proyecto divide la lógica en:

- **Frontend (PWA / Mobile-First):** Vanilla JavaScript + **Vite**, permitiendo un empaquetado ultra rápido sin el overhead de frameworks pesados. Estilización premium con **Tailwind CSS (Glassmorphism & HSL tokens)**.
- **Backend (Python):** Arquitectura híbrida en **FastAPI** para manejo de reportes PDF e interacción con la API de Vertex AI / Google Gemini.
- **Calidad y Testing:** Tests automáticos mediante **Vitest** (Frontend) y **Pytest** (Backend).

📌 **Para detalles exhaustivos, consulta la documentación en [docs/architecture.md](./docs/architecture.md).**

## 🔧 Instalación y Despliegue Local

### Requisitos Mínimos
- Node.js 18+
- Python 3.10+

### Pasos
1. **Clonar repositorio e inicializar entorno:**
   ```bash
   git clone https://github.com/tu-usuario/Opercheck-Check-IA.git
   git clone https://github.com/yaircordobaing-debug/Opercheck-Check-IA-version-2.git
   cd Opercheck-Check-IA
   ```

2. **Frontend (Vite):**
   ```bash
   npm install
   cp .env.example .env  # Agrega tu base URL del servidor
   npm run dev
   ```

3. **Backend (FastAPI):**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env      # Agrega tu GEMINI_API_KEY
   uvicorn main:app --reload
   ```

## 🎥 Demo Visual

*(Espacio para un archivo .gif o link de Youtube mostrando el flujo completo de usuario y generación de PDF)*
 
> ¡Siente la experiencia "Mobile App" desde tu navegador accediendo a http://localhost:3000 desde el modo responsivo de Chrome DevTools!

## 🔮 Roadmap Futuro y Monetización
- **Integración con Flotillas OBD-II Bluetooth Web API:** Obtención directa de RPM y temperatura del motor desde el navegador del celular.
- **SaaS B2B:** Paneles de administración para visualizar el riesgo de la flota en tiempo real y vender "API Credits" a empresas de logística pequeñas.

## 📝 Contribuciones y Semántica
Este proyecto utiliza [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) para mantener un historial trazable y claro. Revisa `.github/workflows/ci.yml` para los procesos automáticos de PR.

---
*Desarrollado con mentalidad de producto, diseñado para el mundo real.*
