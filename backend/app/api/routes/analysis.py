from fastapi import APIRouter, UploadFile, File, Form
from backend.app.services.ia_service import IAService

router = APIRouter()

@router.post("/analyze")
async def analyze_evidence(
    item_id: str = Form(...),
    prompt: str = Form(...),
    image: UploadFile = File(...)
):
    """IA Vision Analysis Endpoint."""
    return await IAService.analyze_image(item_id, prompt, image)
