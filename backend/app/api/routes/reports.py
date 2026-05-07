from fastapi import APIRouter
from backend.app.models.schemas import ReportRequest, AccidentReportRequest
from backend.app.services.pdf_service import PDFService

router = APIRouter()

@router.post("/generate-report")
async def generate_report(request: ReportRequest):
    """Generates a legal-ready PDF report."""
    return PDFService.generate_inspection_pdf(request)

@router.post("/generate-accident-report")
async def generate_accident_report(request: AccidentReportRequest):
    """Generates a PDF report for an accident."""
    return PDFService.generate_accident_pdf(request)
