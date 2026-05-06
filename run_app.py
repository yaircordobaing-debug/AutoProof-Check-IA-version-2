import subprocess
import os
import sys
import threading
import time
import signal

processes = []

def run_command(command, cwd=None, name=""):
    print(f"[*] Iniciando {name}...")
    process = subprocess.Popen(
        command,
        cwd=cwd,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        universal_newlines=True
    )
    processes.append(process)
    
    for line in process.stdout:
        print(f"[{name}] {line.strip()}")
    
    process.wait()

def cleanup():
    print("\n[!] Deteniendo servicios...")
    for p in processes:
        try:
            # Terminate the shell process and its children
            if sys.platform == "win32":
                subprocess.call(['taskkill', '/F', '/T', '/PID', str(p.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                p.terminate()
        except Exception:
            pass

if __name__ == "__main__":
    print("=========================================")
    print("   AUTOPROOF CHECK IA - INICIO RÁPIDO   ")
    print("=========================================")

    # 1. Rutas
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    
    # 2. Comandos
    # Backend: Usar el venv si existe
    venv_python = os.path.join(backend_dir, "venv", "Scripts", "python.exe")
    if not os.path.exists(venv_python):
        import shutil
        if shutil.which("python"):
            venv_python = "python"
        elif shutil.which("py"):
            venv_python = "py"
        else:
            venv_python = "python"
        
    # Ejecutar el backend modular usando uvicorn desde la raíz del proyecto para evitar errores de importación
    backend_cmd = f'"{venv_python}" -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000'
    frontend_cmd = "npm run dev"

    # Verificación de node_modules
    if not os.path.exists(os.path.join(root_dir, "node_modules")):
        print("[!] ERROR: No se encontró la carpeta 'node_modules'. Por favor ejecuta 'npm install' antes de continuar.")

    # 3. Hilos para ejecución concurrente
    threads = []
    
    t_back = threading.Thread(target=run_command, args=(backend_cmd, root_dir, "BACKEND"), daemon=True)
    threads.append(t_back)
    
    t_front = threading.Thread(target=run_command, args=(frontend_cmd, root_dir, "FRONTEND"), daemon=True)
    threads.append(t_front)

    for t in threads:
        t.start()
        time.sleep(1)

    print("\n[!] Sistema en ejecución. Presiona Ctrl+C para detener.\n")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        cleanup()
        sys.exit(0)
