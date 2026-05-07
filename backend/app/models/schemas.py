from pydantic import BaseModel
from typing import List, Optional

class InspectionItem(BaseModel):
    id: str
    name: str
    status: str
    method: str  # 'IA-V', 'IA-A', 'OBD', 'USR', 'VAL', 'EVD', 'LEG'
    observation: Optional[str] = ""
    detected_values: Optional[str] = ""
    signature_data: Optional[str] = "" # Base64 signature if LEG
    image_data: Optional[str] = ""     # Base64 image for the report

class ReportRequest(BaseModel):
    trip_id: str
    driver_name: str
    vehicle_plate: str
    items: List[InspectionItem]
    score: int
    status: str
    email: str
    signature: Optional[str] = ""

class AccidentReportRequest(BaseModel):
    driver_name: str
    driver_id: str
    driver_phone: str
    driver_license: str
    vehicle_plate: str
    vehicle_soat: str
    vehicle_insurance: str
    photos: List[str] # List of base64 images
    witnesses: List[dict] # Not implemented completely but good to have
    doc_soat: Optional[str] = ""
    doc_lic: Optional[str] = ""
    doc_prop: Optional[str] = ""
