from fastapi import APIRouter
from backend.app.models.schemas import ReportRequest
from backend.app.services.pdf_service import PDFService

router = APIRouter()

@router.post("/generate-report")
async def generate_report(request: ReportRequest):
    """Generates a legal-ready PDF report."""
    return PDFService.generate_inspection_pdf(request)
