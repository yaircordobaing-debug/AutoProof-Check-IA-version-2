from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from backend.app.api.routes import analysis, reports
from backend.app.config.settings import settings
import os

app = FastAPI(title=settings.PROJECT_TITLE)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(analysis.router, prefix="/v1", tags=["IA Analysis"])
app.include_router(reports.router, prefix="/v1", tags=["Reports"])

# Servir archivos de la carpeta src con MIME type forzado (MANUAL)
@app.get("/src/{path:path}")
async def serve_src(path: str):
    file_path = os.path.join("src", path)
    if not os.path.exists(file_path):
        return Response(status_code=404)
    
    # Determinar el MIME type manualmente
    content_type = "application/javascript" if path.endswith(".js") else \
                   "text/css" if path.endswith(".css") else \
                   "image/png" if path.endswith(".png") else \
                   "image/jpeg" if path.endswith(".jpg") or path.endswith(".jpeg") else \
                   "application/octet-stream"
    
    with open(file_path, "rb") as f:
        return Response(content=f.read(), media_type=content_type)

# Servir el index.html en la raíz
@app.get("/")
async def read_index():
    return FileResponse("index.html")

# Servir el resto de archivos (assets, favicon, etc.)
if os.path.exists("assets"):
    app.mount("/assets", StaticFiles(directory="assets"), name="assets")

if not os.path.exists(settings.REPORTS_DIR):
    os.makedirs(settings.REPORTS_DIR)
app.mount("/reports", StaticFiles(directory=settings.REPORTS_DIR), name="reports")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
