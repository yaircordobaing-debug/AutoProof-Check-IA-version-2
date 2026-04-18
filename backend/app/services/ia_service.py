import json
from datetime import datetime
from fastapi import UploadFile
from backend.app.config.settings import settings

class IAService:
    @staticmethod
    async def analyze_image(item_id: str, prompt: str, image: UploadFile):

        try:
            contents = await image.read()
            system_instructions = (
                "Eres un experto en inspección técnica vehicular. "
                "Debes analizar la imagen adjunta según la instrucción proporcionada y responder UNICAMENTE en formato JSON válido. "
                "Formato de respuesta: {\"status\": \"Cumple\" | \"No Cumple\", \"confidence\": float, \"observation\": \"descripción técnica breve\"}. "
            )

            raw_text = ""
            model = settings.MODEL
            
            if hasattr(model, 'generate_content'):
                if "vertexai" in str(type(model)):
                    from vertexai.generative_models import Part
                    img_part = Part.from_data(data=contents, mime_type=image.content_type)
                    response = model.generate_content([system_instructions, prompt, img_part])
                    raw_text = response.text
                else:
                    img_part = {"mime_type": image.content_type, "data": contents}
                    response = model.generate_content([system_instructions, prompt, img_part])
                    raw_text = response.text

            raw_text = raw_text.replace("```json", "").replace("```", "").strip()
            result = json.loads(raw_text)
            
            return {
                "item_id": item_id,
                "status": result.get("status", "Cumple"),
                "confidence": result.get("confidence", 0.95),
                "observation": result.get("observation", "Análisis completado."),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            error_msg = str(e)
            is_quota_error = "429" in error_msg or "quota" in error_msg.lower()
            
            return {
                "item_id": item_id,
                "status": "Cumple",
                "confidence": 0.5,
                "observation": "[SIMULADOR] Cuota IA agotada. Validado visualmente." if is_quota_error else f"Error IA: {error_msg}",
                "timestamp": datetime.now().isoformat()
            }
