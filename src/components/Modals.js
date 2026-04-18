export function renderModals() {
    return `
        <!-- ================= MODAL DE CAMARA IA ================= -->
        <div id="cameraModal" class="fixed inset-0 bg-gray-900/95 z-50 hidden flex-col justify-center items-center p-4 backdrop-blur-sm">
            <div class="bg-white rounded-[2rem] w-full max-w-sm sm:max-w-lg lg:max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
                
                <!-- Header -->
                <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 id="modalTitle" class="font-bold text-gray-800 text-lg">Inspección</h3>
                    <button onclick="closeModal()" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="p-6 flex-1 overflow-y-auto">
                    <!-- Instrucciones -->
                    <p id="modalInstructions" class="text-sm text-gray-600 mb-6 bg-blue-50 p-3 rounded-xl border border-blue-100"></p>
                    
                    <!-- AREA DE IMAGEN (Clickable) -->
                    <div id="imagePreviewContainer" onclick="document.getElementById('cameraInput').click()"
                        class="w-full h-56 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden mb-4 cursor-pointer hover:bg-gray-100 transition-colors">
                        <img id="imagePreview" class="absolute inset-0 w-full h-full object-cover hidden z-10">
                        <div id="uploadPrompt" class="text-center text-gray-400 flex flex-col items-center">
                            <i class="fa-solid fa-camera text-4xl mb-3 text-gray-300"></i>
                            <span class="text-sm font-medium">Click para capturar evidencia</span>
                        </div>
                    </div>

                    <!-- Input Numérico (Opcional según tipo) -->
                    <div id="numericalInputContainer" class="hidden mb-4">
                        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Valor Medido</label>
                        <div class="flex items-center gap-3 mt-1">
                            <input type="number" id="valInput" class="flex-1 p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-jungle outline-none font-bold text-lg" placeholder="0.0">
                            <span id="valUnit" class="text-gray-500 font-bold"></span>
                        </div>
                    </div>

                    <!-- Cuadro de Observaciones (SIEMPRE VISIBLE) -->
                    <div id="observationInputContainer" class="mb-4">
                        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Observaciones</label>
                        <textarea id="itemObservation" rows="2" 
                            class="w-full mt-1 p-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-jungle outline-none text-sm text-gray-700 resize-none"
                            placeholder="Detalles adicionales..."></textarea>
                    </div>

                    <!-- Botones de Captura -->
                    <div id="captureButtons" class="grid grid-cols-2 gap-3 mb-4">
                        <button type="button" onclick="document.getElementById('cameraInput').click()"
                            class="flex flex-col items-center justify-center gap-2 p-4 bg-jungle/10 border-2 border-jungle/30 rounded-2xl active:scale-95 transition-all">
                            <i class="fa-solid fa-camera text-2xl text-jungle"></i>
                            <span class="text-[10px] font-bold text-jungle uppercase">Tomar Foto</span>
                        </button>
                        <button id="btnUploadPC" type="button" onclick="document.getElementById('galleryInput').click()"
                            class="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl active:scale-95 transition-all">
                            <i class="fa-solid fa-folder-open text-2xl text-blue-500"></i>
                            <span class="text-[10px] font-bold text-blue-600 uppercase">Subir Imagen</span>
                        </button>
                    </div>
                    
                    <input type="file" accept="image/*" capture="environment" id="cameraInput" class="hidden">
                    <input type="file" accept="image/*" id="galleryInput" class="hidden">

                    <!-- RESULTADO DEL ANÁLISIS (Solo se muestra tras la IA) -->
                    <div id="analysisResult" class="hidden rounded-2xl p-5 border mt-4">
                        <div class="flex items-center gap-3 mb-3">
                            <div id="resultIcon"></div>
                            <h4 id="resultStatus" class="font-bold text-xl"></h4>
                        </div>
                        <p id="resultObservation" class="text-sm text-gray-700"></p>
                        
                        <div class="grid grid-cols-2 gap-3 mt-4">
                            <button onclick="saveResult()" class="bg-jungle text-white py-3 rounded-xl font-bold text-sm">Continuar</button>
                            <button onclick="retryAnalysis()" class="bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm">Repetir</button>
                        </div>
                    </div>
                </div>

                <!-- Footer Acciones -->
                <div id="modalFooter" class="p-5 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
                    <button id="btnAnalyze" onclick="startAnalysis()" class="w-full bg-jungle text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50">
                        Analizar con IA
                    </button>
                    <button id="btnBypassIA" onclick="openLegalWaiver()" class="w-full bg-white border-2 border-amber-400 text-amber-600 py-4 rounded-2xl font-bold">
                        Validación Manual (LEG)
                    </button>
                    
                    <!-- Botones SÍ/NO para Categoría 3 y 4 -->
                    <div id="manualButtons" class="hidden grid grid-cols-2 gap-3">
                        <button onclick="saveResultWithStatus('Cumple')" class="bg-jungle text-white py-4 rounded-2xl font-bold">SÍ</button>
                        <button onclick="saveResultWithStatus('No Cumple')" class="bg-red-600 text-white py-4 rounded-2xl font-bold">NO</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ================= MODAL DE CARGA IA (ANALIZANDO) ================= -->
        <div id="loadingOverlay" class="fixed inset-0 bg-gray-900/80 z-[100] hidden flex-col justify-center items-center backdrop-blur-md">
            <div class="loader mb-6"></div>
            <h3 class="text-white font-bold text-xl animate-pulse tracking-widest">ANALIZANDO CON IA...</h3>
            <p class="text-gray-400 text-sm mt-2">Por favor, espera un momento.</p>
        </div>

        <!-- ================= MODAL LEGAL (WAIVER) ================= -->
        <div id="legalModal" class="fixed inset-0 bg-gray-900/95 z-[60] hidden flex-col justify-center items-center p-4 backdrop-blur-md">
            <div class="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
                <div class="p-6 border-b border-gray-100 bg-amber-50 text-amber-800">
                    <h3 class="font-bold text-lg">Exención Legal</h3>
                </div>
                <div class="p-6 overflow-y-auto">
                    <div class="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6 text-[10px] text-amber-800 italic">
                        "Declaro bajo mi responsabilidad que este componente se encuentra en buen estado. En caso de falla posterior, la responsabilidad recae exclusivamente en el conductor."
                    </div>
                    <label id="legalCheckboxLabel" class="flex items-center gap-4 cursor-pointer mb-6 p-5 border-2 border-gray-100 rounded-[2rem] transition-all duration-300 bg-gray-50">
                        <input type="checkbox" id="legalCheckbox" 
                            onchange="const l=document.getElementById('legalCheckboxLabel'); l.classList.toggle('bg-amber-100'); l.classList.toggle('border-amber-500'); l.classList.toggle('scale-[1.02]');"
                            class="w-10 h-10 accent-amber-600 cursor-pointer">
                        <span class="text-sm font-black text-gray-800 leading-tight">Acepto los términos de responsabilidad operativa.</span>
                    </label>
                    <textarea id="legalComment" rows="2" class="w-full p-3 bg-gray-50 border rounded-xl text-sm" placeholder="Comentario opcional..."></textarea>
                </div>
                <div class="p-6 border-t bg-gray-50 flex gap-3">
                    <button onclick="closeLegalModal()" class="flex-1 py-4 text-gray-500 font-bold">Cancelar</button>
                    <button onclick="confirmLegalValidation()" class="flex-1 py-4 bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-200">Confirmar</button>
                </div>
            </div>
        </div>

        <!-- ================= MODAL FINAL (EMAIL + FIRMA) ================= -->
        <div id="finalModal" class="fixed inset-0 bg-gray-900/95 z-[70] hidden flex-col justify-center items-center p-4 backdrop-blur-md">
            <div class="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
                <div class="p-6 bg-jungle text-white font-bold text-center">FINALIZAR INSPECCIÓN</div>
                <div class="p-6">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enviar Reporte a:</label>
                    <input type="email" id="driverEmail" class="w-full p-4 bg-gray-50 border rounded-2xl mb-4 mt-1" placeholder="correo@empresa.com">
                    
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Firma Digital Única</label>
                    <div class="relative mb-6 mt-1">
                        <canvas id="signature-pad" width="300" height="150" class="w-full border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50"></canvas>
                        <button onclick="clearSignature()" class="absolute top-2 right-2 p-2 text-gray-400"><i class="fa-solid fa-eraser"></i></button>
                    </div>

                    <button onclick="submitFinalReport()" class="w-full bg-jungle text-white py-4 rounded-2xl font-bold shadow-lg">Generar Reporte PDF</button>
                    <button onclick="document.getElementById('finalModal').classList.add('hidden')" class="w-full mt-3 text-gray-400 text-xs font-bold uppercase">Volver</button>
                </div>
            </div>
        </div>
    `;
}
