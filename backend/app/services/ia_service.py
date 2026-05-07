import json
import time
from fastapi import UploadFile

class IAService:
    @staticmethod
    async def analyze_image(item_id: str, prompt: str, image: UploadFile):
        # AI desactivada temporalmente por petición del usuario.
        # Devuelve un análisis simulado en 1 segundo.
        time.sleep(1)
        
        return {
            "status": "Cumple", 
            "observation": "⚠️ [IA DESACTIVADA] Análisis automático simulado. El componente aparenta estar en buen estado.",
            "fallback_triggered": True,
            "_ai_logs": ["AI Module Disabled by user"]
        }
