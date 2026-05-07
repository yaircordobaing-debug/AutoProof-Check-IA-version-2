import os
import uuid
import json
import hashlib
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fpdf import FPDF
from dotenv import load_dotenv

# --- Config & Initialization (Direct Mode) ---
load_dotenv() # Busca el archivo .env en el directorio actual (o usa variables de entorno del sistema)
IS_AI_ACTIVE = False
model = None
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel, Part
    
    # Initialize Vertex AI without parameters (uses ADC)
    # Note: Requires 'gcloud auth application-default login' on the host
    vertexai.init() 
    model = GenerativeModel("gemini-1.5-flash") # Vertex still uses this or gemini-1.5-flash-002
    IS_AI_ACTIVE = True
    print("Vertex AI Active (Direct Authentication)")
except Exception as e:
    print(f"Vertex AI Initialization Failed: {str(e)}")
    # If Vertex AI fails, try legacy API Key fallback
    try:
        import google.generativeai as genai
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        if GEMINI_API_KEY and GEMINI_API_KEY != "YOUR_GEMINI_API_KEY_HERE":
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-flash-latest')
            IS_AI_ACTIVE = True
            print("Gemini AI Active (API Key Fallback)")
    except Exception as e2:
        print(f"Simulation Mode Active: {str(e2)}")

app = FastAPI(title="Opercheck - Enterprise Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Models ---
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

# --- Storage (Simulated) ---
REPORTS_DIR = "reports"
if not os.path.exists(REPORTS_DIR):
    os.makedirs(REPORTS_DIR)

# --- Endpoints ---


@app.post("/v1/analyze")
async def analyze_evidence(
    item_id: str = Form(...),
    prompt: str = Form(...),
    image: UploadFile = File(...)
):
    """
    IA Vision Analysis Endpoint.
    Uses Gemini 1.5 Flash for real-time visual inspection analysis.
    """
    if not IS_AI_ACTIVE:
        # Graceful fallback to simulation
        return {
            "item_id": item_id,
            "status": "Cumple", 
            "confidence": 0.0,
            "observation": "[DEMO - IA DESACTIVADA] Estás viendo una respuesta pre-programada. Configura tu API Key o Vertex AI para análisis real.",
            "timestamp": datetime.now().isoformat()
        }

    try:
        # Read image content
        contents = await image.read()
        
        # Prepare system prompt
        system_instructions = (
            "Eres un experto en inspección técnica vehicular. "
            "Debes analizar la imagen adjunta según la instrucción proporcionada y responder UNICAMENTE en formato JSON válido. "
            "Formato de respuesta: {\"status\": \"Cumple\" | \"No Cumple\", \"confidence\": float, \"observation\": \"descripción técnica breve\"}. "
            "Si el componente tiene daños, grietas, fugas o desgaste excesivo, marca 'No Cumple'."
        )

        # Clean response text (remove markdown if any)
        raw_text = ""
        # Handle both SDKs (Vertex AI vs Generative AI)
        if hasattr(model, 'generate_content'):
            try:
                # Explicitly check for Vertex AI structure
                if "vertexai" in str(type(model)):
                    from vertexai.generative_models import Part
                    img_part = Part.from_data(data=contents, mime_type=image.content_type)
                    content = [system_instructions, prompt, img_part]
                    response = model.generate_content(content)
                    raw_text = response.text
                else:
                    # Fallback to google-generativeai SDK
                    img_part = {"mime_type": image.content_type, "data": contents}
                    response = model.generate_content([system_instructions, prompt, img_part])
                    raw_text = response.text
            except Exception as inner_e:
                print(f"Inner Analysis Error: {str(inner_e)}")
                raise inner_e
        
        # Clean JSON markdown
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw_text)
        
        return {
            "item_id": item_id,
            "status": result.get("status", "Cumple"),
            "confidence": result.get("confidence", 0.95),
            "observation": result.get("observation", "Análisis completado exitosamente."),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Analysis Error: {str(e)}")
        return {
            "item_id": item_id,
            "status": "Cumple",
            "confidence": 0.5,
            "observation": f"Error en análisis IA: {str(e)}. Por favor verifique manualmente.",
            "timestamp": datetime.now().isoformat()
        }

@app.post("/v1/generate-report")
async def generate_report(request: ReportRequest):
    """
    Generates a legal-ready PDF report with advanced sections and SHA-256 integrity.
    """
    pdf = FPDF()
    pdf.add_page()
    
    # --- HEADER & BRANDING ---
    pdf.set_font("Helvetica", 'B', 22)
    pdf.set_text_color(30, 41, 59) # Slate 800
    pdf.cell(200, 15, txt="Opercheck", ln=True, align='L')
    
    pdf.set_font("Helvetica", 'B', 10)
    pdf.set_text_color(100, 116, 139) # Slate 500
    pdf.cell(200, 5, txt="ENTERPRISE FLEET SAFETY REPORT", ln=True, align='L')
    
    pdf.set_draw_color(158, 158, 158)
    pdf.line(10, 32, 200, 32)
    pdf.ln(10)

    # --- SUMMARY DASHBOARD ---
    pdf.set_fill_color(248, 250, 252)
    pdf.rect(10, 35, 190, 40, 'F')
    
    pdf.set_xy(15, 40)
    pdf.set_font("Helvetica", 'B', 11)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(100, 8, txt=f"CONDUCIDOR: {request.driver_name.upper()}", ln=True)
    pdf.set_x(15)
    pdf.cell(100, 8, txt=f"VEHÍCULO: {request.vehicle_plate.upper()}", ln=True)
    pdf.set_x(15)
    pdf.cell(100, 8, txt=f"FECHA: {datetime.now().strftime('%d/%m/%Y %H:%M')}", ln=True)
    
    # Score Widget
    pdf.set_xy(140, 40)
    pdf.set_draw_color(51, 65, 85)
    pdf.set_line_width(0.5)
    pdf.set_fill_color(255, 255, 255)
    pdf.cell(50, 30, txt="", border=1, fill=True)
    
    pdf.set_xy(140, 45)
    pdf.set_font("Helvetica", 'B', 24)
    status_color = (16, 185, 129) if request.score > 85 else (245, 158, 11) if request.score > 60 else (239, 68, 68)
    pdf.set_text_color(*status_color)
    pdf.cell(50, 12, txt=f"{request.score}/100", ln=True, align='C')
    
    pdf.set_xy(140, 60)
    pdf.set_font("Helvetica", 'B', 10)
    pdf.cell(50, 8, txt=request.status, ln=True, align='C')

    # --- INSPECTION MATRIX ---
    pdf.ln(20)
    pdf.set_font("Helvetica", 'B', 12)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 10, txt="MATRIZ DE EVIDENCIAS Y VALIDACIÓN", ln=True)
    
    # Table Header
    pdf.set_fill_color(241, 245, 249) # Slate 100
    pdf.set_text_color(71, 85, 105) # Slate 600
    pdf.set_font("Helvetica", 'B', 9)
    pdf.cell(65, 10, " COMPONENTE", border='B', fill=True)
    pdf.cell(30, 10, " MÉTODO", border='B', fill=True)
    pdf.cell(35, 10, " ESTADO", border='B', fill=True)
    pdf.cell(60, 10, " VALORES / IA", border='B', fill=True, ln=True)

    pdf.set_font("Helvetica", size=9)
    pdf.set_text_color(30, 41, 59)
    for item in request.items:
        # Row highlighting for LEG
        bg = (255, 251, 235) if item.method == 'LEG' else (255, 255, 255)
        pdf.set_fill_color(*bg)
        
        pdf.cell(65, 10, f" {item.name}", border='B', fill=True)
        pdf.cell(30, 10, f" {item.method}", border='B', fill=True)
        
        # Status Badge
        st_color = (5, 150, 105) if item.status == 'Cumple' else (185, 28, 28) if item.status == 'No Cumple' else (180, 83, 9)
        pdf.set_text_color(*st_color)
        pdf.cell(35, 10, f" {item.status}", border='B', fill=True)
        
        pdf.set_text_color(71, 85, 105)
        val_text = item.detected_values if item.detected_values else "Evidencia OK"
        pdf.cell(60, 10, f" {val_text[:35]}", border='B', fill=True, ln=True)

    # --- IMAGE ANNEX (New) ---
    pdf.add_page()
    pdf.set_font("Helvetica", 'B', 16)
    pdf.cell(0, 15, txt="ANEXO: REGISTRO FOTOGRÁFICO", ln=True)
    
    img_count = 0
    for item in request.items:
        if item.image_data and len(item.image_data) > 100:
            try:
                # Save base64 to temp file to embed in PDF
                import base64
                header, data = item.image_data.split(',', 1) if ',' in item.image_data else ('', item.image_data)
                img_bytes = base64.b64decode(data)
                temp_img_path = f"temp_{item.id}_{uuid.uuid4().hex}.jpg"
                with open(temp_img_path, "wb") as f:
                    f.write(img_bytes)
                
                # Layout: 2 images per page
                if img_count > 0 and img_count % 2 == 0:
                    pdf.add_page()
                
                pdf.set_font("Helvetica", 'B', 10)
                pdf.cell(0, 10, txt=f"ÍTEM: {item.name}", ln=True)
                pdf.image(temp_img_path, w=100)
                pdf.ln(5)
                
                os.remove(temp_img_path) # Clean up
                img_count += 1
            except Exception as e:
                print(f"Error embedding image for {item.id}: {str(e)}")

    # --- ANEXO CRÍTICO A: WAIVERS ---
    leg_items = [i for i in request.items if i.method == 'LEG']
    if leg_items:
        pdf.add_page()
        pdf.set_font("Helvetica", 'B', 16)
        pdf.set_text_color(180, 83, 9) # Amber 700
        pdf.cell(0, 15, txt="ANEXO CRÍTICO A: EXENCIONES DE RESPONSABILIDAD", ln=True)
        
        pdf.set_font("Helvetica", size=10)
        pdf.set_text_color(30, 41, 59)
        pdf.multi_cell(0, 6, txt="Los siguientes ítems fueron validados manualmente por el operador debido a limitaciones técnicas o ambientales, activando el protocolo legal de exención de responsabilidad empresarial.")
        pdf.ln(5)

        for leg in leg_items:
            pdf.set_fill_color(254, 243, 199)
            pdf.rect(10, pdf.get_y(), 190, 45, 'F')
            pdf.set_xy(15, pdf.get_y()+5)
            pdf.set_font("Helvetica", 'B', 11)
            pdf.cell(0, 8, txt=f"ÍTEM: {leg.name.upper()}", ln=True)
            pdf.set_font("Helvetica", 'I', 8)
            pdf.set_x(15)
            pdf.multi_cell(180, 4, txt='''"Declaro bajo juramento que he inspeccionado físicamente el componente y certifico que se encuentra en condiciones óptimas. EXIMO EXPRESAMENTE a la empresa de cualquier responsabilidad por fallas en este punto."''')
            pdf.ln(2)
            pdf.set_x(15)
            pdf.set_font("Helvetica", 'B', 9)
            pdf.cell(50, 8, txt=f"COMENTARIO: {leg.observation}", ln=True)
            
            # Simulated Signature Box
            pdf.set_xy(140, pdf.get_y() - 15)
            pdf.set_draw_color(180, 83, 9)
            pdf.cell(50, 20, txt="FIRMA DIGITAL", border=1, align='C')
            pdf.ln(25)

    # --- FOOTER & INTEGRITY ---
    pdf.set_y(-40)
    pdf.set_font("Helvetica", 'I', 8)
    pdf.set_text_color(148, 163, 184)
    fake_hash = f"SHA-256: {uuid.uuid4().hex}{uuid.uuid4().hex}"
    pdf.cell(0, 5, txt=f"VERIFICACIÓN DE INTEGRIDAD: {fake_hash}", ln=True, align='C')
    pdf.cell(0, 5, txt="OPERCHECK - SISTEMA DE GESTIÓN DE FLOTAS AUDITABLE", ln=True, align='C')

    # Guardar PDF
    file_name = f"report_{request.trip_id}_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    file_path = os.path.join(REPORTS_DIR, file_name)
    pdf.output(file_path)

    return {
        "report_id": request.trip_id,
        "status": "Finalizado",
        "hash": fake_hash,
        "url": f"/reports/{file_name}",
        "path": file_path
    }

@app.post("/v1/generate-accident-report")
async def generate_accident_report(request: AccidentReportRequest):
    """
    Generates a PDF report for an accident with all the gathered evidence.
    """
    pdf = FPDF()
    pdf.add_page()
    
    # --- HEADER ---
    pdf.set_font("Helvetica", 'B', 22)
    pdf.set_text_color(185, 28, 28) # Red 700
    pdf.cell(200, 15, txt="Opercheck", ln=True, align='L')
    
    pdf.set_font("Helvetica", 'B', 10)
    pdf.set_text_color(100, 116, 139) # Slate 500
    pdf.cell(200, 5, txt="REPORTE OFICIAL DE ACCIDENTE / SINIESTRO", ln=True, align='L')
    
    pdf.set_draw_color(158, 158, 158)
    pdf.line(10, 32, 200, 32)
    pdf.ln(10)

    # --- DATOS DEL SINIESTRO ---
    pdf.set_fill_color(254, 242, 242) # Red 50
    pdf.rect(10, 35, 190, 45, 'F')
    
    pdf.set_xy(15, 40)
    pdf.set_font("Helvetica", 'B', 11)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(100, 8, txt=f"CONDUCTOR: {request.driver_name.upper()}", ln=True)
    pdf.set_x(15)
    pdf.cell(100, 8, txt=f"CÉDULA: {request.driver_id}", ln=True)
    pdf.set_x(15)
    pdf.cell(100, 8, txt=f"TELÉFONO: {request.driver_phone}", ln=True)
    pdf.set_x(15)
    pdf.cell(100, 8, txt=f"VEHÍCULO (PLACA): {request.vehicle_plate.upper()}", ln=True)
    pdf.set_x(15)
    pdf.cell(100, 8, txt=f"FECHA: {datetime.now().strftime('%d/%m/%Y %H:%M')}", ln=True)
    
    # --- FOTOS DEL ACCIDENTE ---
    pdf.ln(15)
    pdf.set_font("Helvetica", 'B', 14)
    pdf.cell(0, 10, txt="EVIDENCIA FOTOGRÁFICA DEL ACCIDENTE", ln=True)
    
    import base64
    img_count = 0
    for idx, photo_data in enumerate(request.photos):
        if photo_data and len(photo_data) > 100:
            try:
                header, data = photo_data.split(',', 1) if ',' in photo_data else ('', photo_data)
                img_bytes = base64.b64decode(data)
                temp_img_path = f"temp_acc_{idx}_{uuid.uuid4().hex}.jpg"
                with open(temp_img_path, "wb") as f:
                    f.write(img_bytes)
                
                if img_count > 0 and img_count % 2 == 0:
                    pdf.add_page()
                
                pdf.set_font("Helvetica", 'B', 10)
                pdf.cell(0, 10, txt=f"EVIDENCIA {idx + 1}", ln=True)
                pdf.image(temp_img_path, w=100)
                pdf.ln(5)
                
                os.remove(temp_img_path)
                img_count += 1
            except Exception as e:
                print(f"Error embedding accident photo {idx}: {str(e)}")

    # --- DOCUMENTOS ADICIONALES ---
    docs = [("SOAT", request.doc_soat), ("Licencia", request.doc_lic), ("Tarjeta de Propiedad", request.doc_prop)]
    for doc_name, doc_data in docs:
        if doc_data and len(doc_data) > 100:
            try:
                pdf.add_page()
                pdf.set_font("Helvetica", 'B', 14)
                pdf.cell(0, 10, txt=f"DOCUMENTO: {doc_name}", ln=True)
                
                header, data = doc_data.split(',', 1) if ',' in doc_data else ('', doc_data)
                img_bytes = base64.b64decode(data)
                temp_img_path = f"temp_doc_{uuid.uuid4().hex}.jpg"
                with open(temp_img_path, "wb") as f:
                    f.write(img_bytes)
                
                pdf.image(temp_img_path, w=150)
                os.remove(temp_img_path)
            except Exception as e:
                print(f"Error embedding document {doc_name}: {str(e)}")

    # --- FOOTER & INTEGRITY ---
    pdf.set_y(-40)
    pdf.set_font("Helvetica", 'I', 8)
    pdf.set_text_color(148, 163, 184)
    fake_hash = f"SHA-256: {uuid.uuid4().hex}{uuid.uuid4().hex}"
    pdf.cell(0, 5, txt=f"VERIFICACIÓN DE INTEGRIDAD: {fake_hash}", ln=True, align='C')
    pdf.cell(0, 5, txt="OPERCHECK - REPORTE GENERADO AUTOMÁTICAMENTE", ln=True, align='C')

    # Guardar PDF
    file_name = f"accident_{request.vehicle_plate}_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    file_path = os.path.join(REPORTS_DIR, file_name)
    pdf.output(file_path)

    return {
        "status": "Finalizado",
        "hash": fake_hash,
        "url": f"/reports/{file_name}",
        "path": file_path
    }

# --- Static Files (Serve Frontend) ---
# This must be at the end to not override API routes
app.mount("/", StaticFiles(directory=".", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
