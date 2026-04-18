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
