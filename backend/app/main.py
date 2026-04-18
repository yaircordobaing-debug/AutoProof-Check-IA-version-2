from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.api.routes import analysis, reports
from backend.app.config.settings import settings

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

# Servir carpetas específicas para asegurar que el frontend encuentre todo
app.mount("/src", StaticFiles(directory="src"), name="src")
app.mount("/", StaticFiles(directory=".", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
