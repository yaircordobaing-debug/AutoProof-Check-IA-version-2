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
        <div id="legalModal" class="fixed inset-0 bg-black/70 z-[60] hidden flex-col justify-center items-center p-4 backdrop-blur-md">
            <div class="bg-gray-100 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
                <!-- HEADER -->
                <div class="bg-[#d6d1c3] px-6 py-4 text-left">
                    <h2 class="font-bold text-orange-800 text-lg">Exención Legal</h2>
                </div>

                <!-- BODY -->
                <div class="p-6 space-y-5 flex-1">
                    <!-- TEXTO LEGAL -->
                    <div class="bg-amber-50 border border-amber-300 text-amber-800 text-xs italic p-4 rounded-xl leading-relaxed">
                        "Declaro bajo mi responsabilidad que este componente se encuentra en buen estado. 
                        En caso de falla posterior, la responsabilidad recae exclusivamente en el conductor."
                    </div>

                    <!-- CHECKBOX CUSTOM -->
                    <div class="flex items-center gap-3 cursor-pointer group" onclick="
                        const cb = document.getElementById('legalCheckbox');
                        const box = document.getElementById('customCheckContainer');
                        const icon = document.getElementById('checkIconLegal');
                        const btn = document.getElementById('legalConfirmBtn');
                        cb.checked = !cb.checked;
                        if(cb.checked){
                            box.classList.add('bg-green-600', 'border-green-600');
                            icon.classList.remove('hidden');
                            btn.disabled = false;
                            btn.classList.replace('bg-orange-400', 'bg-orange-500');
                        } else {
                            box.classList.remove('bg-green-600', 'border-green-600');
                            icon.classList.add('hidden');
                            btn.disabled = true;
                            btn.classList.replace('bg-orange-500', 'bg-orange-400');
                        }
                    ">
                        <input type="checkbox" id="legalCheckbox" class="hidden">
                        <div id="customCheckContainer" class="w-8 h-8 flex-shrink-0 rounded-lg border-2 border-gray-300 bg-white flex items-center justify-center transition-all duration-300 shadow-sm">
                            <i id="checkIconLegal" class="fa-solid fa-check text-white text-sm hidden"></i>
                        </div>
                        <span class="text-gray-700 text-sm font-medium leading-snug">
                            Acepto los términos de responsabilidad operativa.
                        </span>
                    </div>

                    <!-- TEXTAREA -->
                    <textarea id="legalComment" rows="3" placeholder="Comentario opcional..." 
                        class="w-full p-4 rounded-xl border border-gray-300 bg-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 text-gray-700"></textarea>
                </div>

                <!-- FOOTER -->
                <div class="flex items-center justify-between px-6 py-5 border-t bg-gray-100">
                    <button onclick="closeLegalModal()" class="text-gray-500 font-semibold hover:text-gray-700 transition-colors">
                        Cancelar
                    </button>
                    <button id="legalConfirmBtn" onclick="confirmLegalValidation()" disabled
                        class="bg-orange-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-500">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>

        <!-- ================= MODAL FINAL (EMAIL + FIRMA) ================= -->
        <div id="finalModal" class="fixed inset-0 bg-black/70 z-[70] hidden flex-col justify-center items-center p-4 backdrop-blur-md">
            <div class="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
                <div class="p-6 bg-jungle text-white font-bold text-center">FINALIZAR INSPECCIÓN</div>
                <div class="p-6">
                    <p class="text-xs text-gray-400 mb-4 text-center">Al generar el reporte, se enviará automáticamente una copia al correo de la empresa.</p>                    
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Firma Digital Única</label>
                    <div class="relative mb-6 mt-1">
                        <canvas id="signature-pad" width="350" height="180" class="w-full border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 touch-none cursor-crosshair"></canvas>
                        <button onclick="clearSignature()" class="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500"><i class="fa-solid fa-eraser"></i></button>
                    </div>

                    <button onclick="submitFinalReport()" class="w-full bg-jungle text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all">Generar Reporte PDF</button>
                    <button onclick="document.getElementById('finalModal').classList.add('hidden')" class="w-full mt-3 text-gray-400 text-xs font-bold uppercase">Volver a la inspección</button>
                </div>
            </div>
        </div>
        <!-- ================= MODAL INCOMPLETO (WARNING) ================= -->
        <div id="incompleteModal" class="fixed inset-0 bg-black/70 z-[80] hidden flex-col justify-center items-center p-4 backdrop-blur-md">
            <div class="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col border-4 border-orange-500">
                <div class="bg-orange-500 p-6 text-white text-center">
                    <i class="fa-solid fa-triangle-exclamation text-4xl mb-2"></i>
                    <h3 class="font-bold text-xl">Inspección Incompleta</h3>
                </div>
                <div class="p-6 text-center">
                    <p id="incompleteMessage" class="text-gray-700 font-medium mb-4"></p>
                    <div class="bg-red-50 border border-red-200 p-4 rounded-xl text-xs text-red-800 italic mb-4">
                        "Entiendo que al finalizar sin completar todos los puntos, asumo la responsabilidad total sobre el estado de los componentes no verificados."
                    </div>
                    
                    <textarea id="forceFinishComment" rows="2" class="w-full p-3 bg-gray-50 border rounded-xl text-sm mb-4" placeholder="¿Por qué finalizas sin completar?"></textarea>
                    
                    <button onclick="forceFinishInspection()" class="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold shadow-lg mb-3">
                        Finalizar bajo mi responsabilidad
                    </button>
                    <button onclick="document.getElementById('incompleteModal').classList.add('hidden')" class="w-full text-gray-500 font-bold text-sm uppercase">
                        Volver a la inspección
                    </button>
                </div>
            </div>
        </div>

        <!-- ================= MODAL RESULTADO PDF (PREMIUM ALERT) ================= -->
        <div id="pdfResultModal" class="fixed inset-0 bg-black/80 z-[90] hidden flex-col justify-center items-center p-4 backdrop-blur-md">
            <div class="bg-[#141a1f] border border-white/10 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col p-6 text-center">
                <div id="pdfResultIconContainer" class="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                    <i id="pdfResultIcon" class="fa-solid text-3xl"></i>
                </div>
                <h3 id="pdfResultTitle" class="font-bold text-xl text-white mb-2 font-outfit"></h3>
                <p id="pdfResultMsg" class="text-gray-300 text-sm mb-6 leading-relaxed whitespace-pre-line"></p>
                <button id="pdfResultBtn" class="w-full py-4 bg-jungle text-white font-bold rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-wide">
                    Aceptar
                </button>
            </div>
        </div>

        <!-- ================= MODAL PREOPERACIONAL IA (EN CONSTRUCCIÓN) ================= -->
        <div id="preopIAModal" class="fixed inset-0 bg-black/80 z-[95] hidden flex-col justify-center items-center p-4 backdrop-blur-md">
            <div class="bg-[#141a1f] border border-white/10 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col p-6 text-center relative">
                <button onclick="document.getElementById('preopIAModal').classList.add('hidden')" class="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
                <div class="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-purple-500/10 border border-purple-500/20">
                    <i class="fa-solid fa-wand-magic-sparkles text-3xl text-purple-400 animate-pulse"></i>
                </div>
                <h3 class="font-bold text-xl text-white mb-2 font-outfit">Próximamente</h3>
                <p class="text-gray-300 text-sm mb-6 leading-relaxed">La funcionalidad de Preoperacional IA no está disponible en este momento. Se realizará el análisis con IA a llantas, vidrios, detección de funcionamiento de las luces, kit de carretera, entre otros componentes, y estará habilitado en muy poco tiempo.</p>
                <button onclick="document.getElementById('preopIAModal').classList.add('hidden')" class="w-full py-4 bg-jungle hover:bg-jungle/90 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wide">
                    Entendido
                </button>
            </div>
        </div>
    `;
}
