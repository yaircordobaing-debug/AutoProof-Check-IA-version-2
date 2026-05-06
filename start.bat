@echo off
set "VENV_PY=backend\venv\Scripts\python.exe"

if exist "%VENV_PY%" (
    "%VENV_PY%" run_app.py
) else (
    py run_app.py || python run_app.py
)
