import { inspectionData } from './data/inspectionItems.js';
import { $, navigate as domNavigate, showNotification } from './utils/dom.js';

// Import Modular Services
import { handleLogin, handleLogout } from './services/auth.js';
import { renderChecklist } from './services/inspection.js';
import { initTripSetup, confirmTripSetup, submitTripReview as runSubmitTripReview } from './services/trip.js';
import { startOBDScan as runOBDScan } from './services/obd.js';
import { openModal as runOpenModal, startAnalysis as runStartAnalysis } from './services/modal.js';
import { evaluarReporte as runEvaluarReporte, submitFinalReport } from './services/reportGenerator.js';
import { updateDashboard } from './views/DashboardView.js';
import { renderModals } from './components/Modals.js';
import { renderBottomNav } from './components/Navigation.js';
import { 
    initAccidentReport, 
    handleAccidentPhoto, 
    nextAccidentPhoto, 
    previewDoc, 
    addWitness, 
    removeWitness, 
    submitAccidentReport 
} from './services/accident.js';

// --- Global State ---
let currentUser = null;
let currentView = 'splash';
let pendingTrip = null;
let activeTrip = null;
let reportsHistory = [];
let inspectionResults = {};
let currentRating = 0;
let currentItemId = null;
let currentImageBase64 = null;
let currentAIResult = null;
let currentFinalReport = null;

// Sequential State
let currentStep = 0;
let seqResults = [];

// --- Helper Functions ---
const navigate = (viewId) => {
    currentView = domNavigate(viewId, currentView, {
        dashboard: () => updateDashboard(currentUser, activeTrip, reportsHistory),
        history: () => {
            const container = $('#historyContainer');
            if (reportsHistory.length === 0) {
                container.innerHTML = '<p class="text-center py-10 opacity-60">No hay reportes disponibles.</p>';
            } else {
                container.innerHTML = reportsHistory.map(r => `
                    <div class="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center mb-3 cursor-pointer" onclick="window.open('${r.url}', '_blank')">
                        <div><p class="text-xs font-bold">${r.id}</p><p class="text-[10px] text-gray-400">${r.date}</p></div>
                        <div class="text-right"><p class="text-xs font-black text-jungle">${r.score}%</p><p class="text-[10px] font-bold text-gray-500">${r.status}</p></div>
                    </div>
                `).join('');
            }
        },
        profile: () => {
            if (currentUser) {
                $('#profileName').innerText = currentUser.name;
                $('#profileEmail').innerText = currentUser.email;
                if (currentUser.assignedVehicle) {
                    $('#profileCarInfo').innerText = `${currentUser.assignedVehicle.brand} ${currentUser.assignedVehicle.model} (${currentUser.assignedVehicle.plate})`;
                } else {
                    $('#profileCarInfo').innerText = 'Sin Asignar';
                }
            } else {
                $('#profileName').innerText = 'Invitado';
                $('#profileEmail').innerText = 'Sin cuenta';
                $('#profileCarInfo').innerText = 'Ninguno';
            }
        },
        'vehicle-panel': () => {
            if (currentUser && currentUser.assignedVehicle) {
                const v = currentUser.assignedVehicle;
                $('#vpPlate').innerText = v.plate;
                $('#vpKM').innerText = `${v.current_km.toLocaleString()} KM`;
            } else {
                $('#vpPlate').innerText = 'Sin Vehículo';
                $('#vpKM').innerText = '-- KM';
            }
        }
    });
};

const resetModalState = () => {
    currentImageBase64 = null;
    currentAIResult = null;
    if ($('#imagePreview')) {
        $('#imagePreview').src = '';
        $('#imagePreview').classList.add('hidden');
    }
    if ($('#uploadPrompt')) $('#uploadPrompt').classList.remove('hidden');
    if ($('#analysisResult')) $('#analysisResult').classList.add('hidden');
    if ($('#analysisState')) $('#analysisState').classList.add('hidden');
    if ($('#btnSaveResult')) $('#btnSaveResult').classList.add('hidden');
    if ($('#btnAnalyze')) {
        $('#btnAnalyze').classList.remove('hidden');
        $('#btnAnalyze').disabled = true;
    }
    if ($('#itemObservation')) $('#itemObservation').value = '';
};

const showResultInModal = (result) => {
    currentAIResult = result;
    if ($('#analysisState')) $('#analysisState').classList.add('hidden');
    
    // Persistence: Show previous image if exists
    if (result.image_data) {
        currentImageBase64 = result.image_data;
        if ($('#imagePreview')) {
            $('#imagePreview').src = currentImageBase64;
            $('#imagePreview').classList.remove('hidden');
        }
        if ($('#uploadPrompt')) $('#uploadPrompt').classList.add('hidden');
        if ($('#btnAnalyze')) $('#btnAnalyze').disabled = false;
    }

    if ($('#analysisResult')) $('#analysisResult').classList.remove('hidden');
    if ($('#resultStatus')) {
        $('#resultStatus').innerText = result.status;
        $('#resultStatus').className = `font-bold text-xl ${result.status === 'Cumple' ? 'text-jungle' : 'text-red-600'}`;
    }
    if ($('#resultObservation')) $('#resultObservation').innerText = result.observation;
    
    // Update observation textarea with existing data
    if ($('#itemObservation') && result.observation) {
        const noteMatch = result.observation.split(' | Nota: ');
        $('#itemObservation').value = noteMatch.length > 1 ? noteMatch[1] : result.observation;
    }

    if ($('#btnSaveResult')) $('#btnSaveResult').classList.remove('hidden');
};

// --- Initialization ---
window.onload = () => {
    // Inject Modular UI Components
    const appComponents = $('#app-components');
    if (appComponents) {
        appComponents.innerHTML = renderModals() + renderBottomNav();
    }

    setTimeout(() => { navigate('login'); }, 1500);
    renderChecklist(inspectionResults);
};

// --- Expose Global Actions for index.html ---
window.appActions = {
    login: async (isUser) => { currentUser = await handleLogin(isUser, navigate); },
    logout: () => { currentUser = handleLogout(navigate); activeTrip = null; },
    navigate: navigate,
    initTripSetup: () => initTripSetup(currentUser, ["Mazda 3", "Toyota Hilux"], navigate),
    initBusTripSetup: () => initTripSetup(currentUser, ["Bus Urbano 1", "Bus Intermunicipal 2", "Bus Escolar 3"], navigate),
    confirmTripSetup: () => { 
        pendingTrip = confirmTripSetup(navigate); 
        if (pendingTrip) {
            inspectionResults = {};
            renderChecklist(inspectionResults);
            navigate('checklist');
        }
    },
    cancelTripSetup: () => {
        if (confirm("¿Estás seguro de que quieres cancelar el chequeo pre-viaje? Se perderá el progreso.")) {
            pendingTrip = null;
            inspectionResults = {};
            navigate('dashboard');
        }
    },
    startOBDScan: () => runOBDScan(),
    
    // Accident Report Actions
    initAccidentReport: () => initAccidentReport(navigate, currentUser, activeTrip),
    handleAccidentPhoto: (input) => handleAccidentPhoto(input),
    nextAccidentPhoto: () => nextAccidentPhoto(navigate),
    previewDoc: (input, imgId) => previewDoc(input, imgId),
    addWitness: () => addWitness(),
    removeWitness: (id) => removeWitness(id),
    submitAccidentReport: () => submitAccidentReport(navigate),
    
    // Trip Lifecycle Actions
    setRating: (rating) => {
        currentRating = rating;
        const stars = $('#starRating').querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('text-gray-200');
                star.classList.add('text-yellow-400');
            } else {
                star.classList.remove('text-yellow-400');
                star.classList.add('text-gray-200');
            }
        });
    },

    submitTripReview: () => {
        const success = runSubmitTripReview(currentRating, navigate);
        if (success) {
            activeTrip = null; // Liberamos el vehículo activo
            currentRating = 0; // Reiniciamos estrellas para el próximo viaje
        }
    },

    // Modal Actions
    openModal: (itemId) => { currentItemId = runOpenModal(itemId, inspectionResults, showResultInModal, resetModalState); },
    openCheckModal: (itemId) => {
        window.appActions.resetSeq();
        currentItemId = runOpenModal(itemId, inspectionResults, showResultInModal, resetModalState);
    },
    getCurrentStep: () => currentStep,
    incrementStep: () => { currentStep++; },
    pushSeqResult: (res) => { seqResults.push(res); },
    getSeqResults: () => seqResults,
    resetSeq: () => { currentStep = 0; seqResults = []; },
    closeModal: () => { $('#cameraModal').classList.add('hidden'); },
    
    handleImageSelect: (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            currentImageBase64 = ev.target.result;
            $('#imagePreview').src = currentImageBase64;
            $('#imagePreview').classList.remove('hidden');
            $('#uploadPrompt').classList.add('hidden');
            $('#btnAnalyze').disabled = false;
        };
        reader.readAsDataURL(file);
    },
    
    startAnalysis: async () => {
        currentAIResult = await runStartAnalysis(currentItemId, currentImageBase64, showResultInModal);
    },
    
    saveResult: () => {
        let itemData;
        inspectionData.forEach(cat => cat.items.forEach(i => { if(i.id === currentItemId) itemData = i; }));

        const userObs = $('#itemObservation').value;
        const finalObs = userObs ? `${currentAIResult.observation} | Nota: ${userObs}` : currentAIResult.observation;
        const val = $('#valInput') ? $('#valInput').value : '';

        // Handle Sequential Items (4 Tires)
        if (itemData.type === 'VAL-SEQ' || itemData.type === 'IA-V-SEQ') {
            const seqLabels = ["Delantera Izquierda", "Delantera Derecha", "Trasera Izquierda", "Trasera Derecha"];
            const currentRes = {
                pos: seqLabels[window.appActions.getCurrentStep()],
                status: currentAIResult.status,
                val: val,
                obs: finalObs
            };
            window.appActions.pushSeqResult(currentRes);

            if (window.appActions.getCurrentStep() < 3) {
                window.appActions.incrementStep();
                // Update Modal for next step
                $('#modalTitle').innerText = `${itemData.name} - ${seqLabels[window.appActions.getCurrentStep()]} (${window.appActions.getCurrentStep() + 1}/4)`;
                window.appActions.retryAnalysis(); // Clean UI for next capture
                return;
            }
            
            // If finished all 4
            const allResults = window.appActions.getSeqResults();
            inspectionResults[currentItemId] = {
                status: allResults.every(r => r.status === 'Cumple') ? 'Cumple' : 'No Cumple',
                method: 'IA-SEQ',
                completed: true,
                observation: allResults.map(r => `${r.pos}: ${r.status} (${r.val})`).join(' | '),
                image_data: currentImageBase64 // Last image or placeholder
            };
        } else {
            // Standard Single Item
            inspectionResults[currentItemId] = { 
                ...currentAIResult, 
                observation: finalObs,
                image_data: currentImageBase64, 
                completed: true 
            };
        }

        renderChecklist(inspectionResults);
        window.appActions.closeModal();
    },

    retryAnalysis: () => {
        currentAIResult = null;
        $('#analysisResult').classList.add('hidden');
        $('#btnAnalyze').classList.remove('hidden');
        $('#btnBypassIA').classList.remove('hidden');
        $('#imagePreview').classList.add('hidden');
        $('#uploadPrompt').classList.remove('hidden');
        $('#itemObservation').value = '';
    },
    
    saveResultWithStatus: (status) => {
        const userObs = $('#itemObservation').value;
        inspectionResults[currentItemId] = { 
            status: status, 
            method: 'USR', 
            completed: true, 
            observation: userObs // Guardamos solo lo que el usuario escribió
        };
        renderChecklist(inspectionResults);
        window.appActions.closeModal();
    },

    // Legal Waiver Actions
    openLegalWaiver: () => { 
        $('#legalComment').value = '';
        $('#legalCheckbox').checked = false;
        $('#legalModal').classList.remove('hidden'); 
        $('#legalModal').classList.add('flex'); 
    },
    closeLegalModal: () => { $('#legalModal').classList.add('hidden'); },
    clearSignature: () => { 
        const canvas = $('#signature-pad');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    confirmLegalValidation: () => {
        if (!$('#legalCheckbox').checked) {
            alert("Debes aceptar los términos de responsabilidad.");
            return;
        }
        const comment = $('#legalComment').value;
        inspectionResults[currentItemId] = { 
            status: 'Cumple', 
            method: 'LEG', 
            completed: true, 
            observation: `Validado bajo protocolo legal. Nota: ${comment || 'Sin comentarios.'}` 
        };
        renderChecklist(inspectionResults);
        window.appActions.closeLegalModal();
        window.appActions.closeModal();
    },

    // Report Actions
    evaluarReporte: () => {
        const res = runEvaluarReporte(inspectionResults, currentUser, activeTrip, pendingTrip);
        if (res && res.incomplete) {
            $('#incompleteMessage').innerText = `Debes completar la inspección. Te faltan ${res.missingCount} puntos.`;
            $('#incompleteModal').classList.remove('hidden');
            $('#incompleteModal').classList.add('flex');
            return;
        }

        currentFinalReport = res;
        if (currentFinalReport) {
            // En lugar de navegar, pedimos la firma primero
            window.appActions.finishReport();
        }
    },

    forceFinishInspection: () => {
        const comment = $('#forceFinishComment').value;
        const res = runEvaluarReporte(inspectionResults, currentUser, activeTrip, pendingTrip, true);
        if (res) {
            res.observation = (res.observation || "") + ` | INSPECCIÓN FORZADA: El inspector acepta responsabilidad. Motivo: ${comment || 'No especificado'}`;
            currentFinalReport = res;
            
            // Clickeamos el modal de advertencia y abrimos la FIRMA (OBLIGATORIO)
            $('#incompleteModal').classList.add('hidden');
            window.appActions.finishReport();
        }
    },
    
    simulateSend: async (type) => {
        if (type === 'Empresa') {
            $('#driverEmail').value = 'yair.cordoba.ing@gmail.com';
            showNotification("Enviando reporte a la empresa...");
            await window.appActions.submitFinalReport();
        } else {
            $('#finalModal').classList.remove('hidden');
            $('#finalModal').classList.add('flex');
        }
    },
    
    initSignaturePad: () => {
        const canvas = document.getElementById('signature-pad');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        // Ajuste de resolución para alta densidad (Retina)
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = rect.height * (window.devicePixelRatio || 1);
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

        let drawing = false;
        const getPos = (e) => {
            const r = canvas.getBoundingClientRect();
            return {
                x: (e.clientX || e.touches[0].clientX) - r.left,
                y: (e.clientY || e.touches[0].clientY) - r.top
            };
        };

        const start = (e) => { drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
        const end = () => { drawing = false; };
        const draw = (e) => {
            if (!drawing) return;
            e.preventDefault();
            const p = getPos(e);
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#1a4332';
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        };

        canvas.addEventListener('mousedown', start);
        canvas.addEventListener('mousemove', draw);
        window.addEventListener('mouseup', end);
        canvas.addEventListener('touchstart', start, {passive: false});
        canvas.addEventListener('touchmove', draw, {passive: false});
        canvas.addEventListener('touchend', end);
    },

    finishReport: () => { 
        $('#finalModal').classList.remove('hidden'); 
        $('#finalModal').classList.add('flex');
        setTimeout(() => window.appActions.initSignaturePad(), 100);
    },
    
    clearSignature: () => {
        const canvas = document.getElementById('signature-pad');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    },

    submitFinalReport: async () => {
        const email = $('#driverEmail').value;
        
        // Capturar Firma (Base64) del canvas
        const canvas = document.getElementById('signature-pad');
        if (canvas) {
            currentFinalReport.signature = canvas.toDataURL();
        }

        if (!email || !email.includes('@')) {
            showNotification("Por favor ingresa un correo válido");
            return;
        }

        const res = await submitFinalReport(currentFinalReport, email, reportsHistory);
        if (res) {
            $('#finalModal').classList.add('hidden');
            
            if (pendingTrip) {
                activeTrip = { ...pendingTrip, status: 'Active', startTime: new Date().toLocaleTimeString() };
                pendingTrip = null;
            }
            inspectionResults = {};
            renderChecklist(inspectionResults);
            
            let finalMsg = "Viaje Iniciado correctamente.";
            if (res.email_sent) {
                finalMsg += " 📧 ¡PDF enviado exitosamente al correo!";
                alert("✅ ¡ÉXITO!\n\nEl reporte PDF ha sido generado y enviado exitosamente al correo que proporcionaste.\n\nHaz clic en 'Aceptar' para visualizar el documento.");
            } else {
                finalMsg += " ⚠️ PDF generado, pero no se pudo enviar el correo.";
                alert("⚠️ ATENCIÓN\n\nEl reporte PDF fue generado correctamente, pero hubo un error al enviarlo al correo. Verifica la conexión o las credenciales.\n\nHaz clic en 'Aceptar' para visualizar el documento.");
            }
            showNotification(finalMsg);
            
            if (res.url) {
                window.open(res.url, '_blank');
            }
            navigate('dashboard');
            return;
        }

        showNotification("No se pudo generar o enviar el reporte. Intenta de nuevo.");
    }
};

// Map original HTML onclicks to appActions
window.simulateSend = window.appActions.simulateSend;
window.login = window.appActions.login;
window.logout = window.appActions.logout;
window.navigate = window.appActions.navigate;
window.initTripSetup = window.appActions.initTripSetup;
window.initBusTripSetup = window.appActions.initBusTripSetup;
window.confirmTripSetup = window.appActions.confirmTripSetup;
window.cancelTripSetup = window.appActions.cancelTripSetup;
window.startOBDScan = window.appActions.startOBDScan;

// Accident Report
window.initAccidentReport = window.appActions.initAccidentReport;
window.handleAccidentPhoto = window.appActions.handleAccidentPhoto;
window.nextAccidentPhoto = window.appActions.nextAccidentPhoto;
window.previewDoc = window.appActions.previewDoc;
window.addWitness = window.appActions.addWitness;
window.removeWitness = window.appActions.removeWitness;
window.submitAccidentReport = window.appActions.submitAccidentReport;

window.openModal = window.appActions.openModal;
window.closeModal = window.appActions.closeModal;
window.startAnalysis = window.appActions.startAnalysis;
window.saveResult = window.appActions.saveResult;
window.evaluarReporte = window.appActions.evaluarReporte;
window.finishReport = window.appActions.finishReport;
window.submitFinalReport = window.appActions.submitFinalReport;
window.openLegalWaiver = window.appActions.openLegalWaiver;
window.closeLegalModal = window.appActions.closeLegalModal;
window.confirmLegalValidation = window.appActions.confirmLegalValidation;
window.clearSignature = window.appActions.clearSignature;
window.retryAnalysis = window.appActions.retryAnalysis;
window.saveResultWithStatus = window.appActions.saveResultWithStatus;
window.forceFinishInspection = window.appActions.forceFinishInspection;
window.setRating = window.appActions.setRating;
window.submitTripReview = window.appActions.submitTripReview;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Inject Modular UI Components
    const appComponents = $('#app-components');
    if (appComponents) {
        appComponents.innerHTML = renderModals() + renderBottomNav();
    }

    // Auto-transition from Splash to Login after 2.5 seconds
    setTimeout(() => {
        navigate('login');
    }, 2500);

    renderChecklist(inspectionResults);
});

// Event Listeners for file inputs
document.addEventListener('change', (e) => {
    if (['fileInput', 'cameraInput', 'galleryInput'].includes(e.target.id)) {
        window.appActions.handleImageSelect(e);
    }
});
