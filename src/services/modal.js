import { $ } from '../utils/dom.js';
import { inspectionData } from '../data/inspectionItems.js';
import { callGeminiAPI } from './api.js';

let currentItemId = null;
let currentImageBase64 = null;
let currentStepIndex = 0;
const seqLabels = ["Delantera Izquierda", "Delantera Derecha", "Trasera Izquierda", "Trasera Derecha"];
let seqResults = [];

export function openModal(itemId, results, showResultInModal, resetModalState) {
    currentItemId = itemId;
    let itemData;
    inspectionData.forEach(cat => cat.items.forEach(i => { if(i.id === itemId) itemData = i; }));

    $('#modalTitle').innerText = itemData.name;
    $('#modalInstructions').innerHTML = itemData.prompt 
        ? `<strong>Instrucción:</strong> ${itemData.prompt}` 
        : `<strong>Instrucción:</strong> Verifica el estado de este componente manualmente.`;
    
    resetModalState();
    
    // Select Elements
    const imgContainer = $('#imagePreviewContainer');
    const numContainer = $('#numericalInputContainer');
    const captureButtons = $('#captureButtons');
    const btnAnalyze = $('#btnAnalyze');
    const btnBypass = $('#btnBypassIA');
    const manualButtons = $('#manualButtons');
    const observationInput = $('#itemObservation');
    const btnUploadPC = $('#btnUploadPC');

    // Reset visibility
    imgContainer.classList.add('hidden');
    numContainer.classList.add('hidden');
    captureButtons.classList.add('hidden');
    btnAnalyze.classList.add('hidden');
    btnBypass.classList.add('hidden');
    manualButtons.classList.add('hidden');
    observationInput.value = '';

    // Detect if mobile to restrict uploads on btnUploadPC
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (btnUploadPC) {
        btnUploadPC.style.display = isMobile ? 'none' : 'flex';
        captureButtons.classList.remove('grid-cols-1', 'grid-cols-2');
        captureButtons.classList.add(isMobile ? 'grid-cols-1' : 'grid-cols-2');
    }

    // Logic by type
    if (itemData.type === 'IA-V' || itemData.type === 'IA-A' || itemData.type === 'VAL' || itemData.type === 'VAL-SEQ' || itemData.type === 'IA-V-SEQ' || itemData.type === 'EVD') {
        imgContainer.classList.remove('hidden');
        imgContainer.classList.add('flex');
        captureButtons.classList.remove('hidden');
        captureButtons.classList.add('grid');
        btnAnalyze.classList.remove('hidden');
        btnBypass.classList.remove('hidden');

        if (itemData.type === 'VAL' || itemData.type === 'VAL-SEQ') {
            numContainer.classList.remove('hidden');
            $('#valUnit').innerText = itemData.unit || '';
        }

        if (itemData.type === 'VAL-SEQ' || itemData.type === 'IA-V-SEQ') {
            currentStepIndex = 0;
            seqResults = [];
            $('#modalTitle').innerText = `${itemData.name} - ${seqLabels[0]} (1/4)`;
        }
    } else if (itemData.type === 'USR') {
        // Mode for Categories 3 & 4: Only Si/No + Observations
        manualButtons.classList.remove('hidden');
        manualButtons.classList.add('grid');
        // Hide camera parts
        imgContainer.classList.add('hidden');
        captureButtons.classList.add('hidden');
    }

    $('#cameraModal').classList.remove('hidden');
    $('#cameraModal').classList.add('flex');
    
    if(results[itemId]) showResultInModal(results[itemId]);
    return currentItemId;
}

export async function startAnalysis(currentItemId, currentImageBase64, showResultInModal) {
    let itemData;
    inspectionData.forEach(cat => cat.items.forEach(i => { if(i.id === currentItemId) itemData = i; }));

    // Show Loading Overlay
    $('#loadingOverlay').classList.remove('hidden');
    $('#loadingOverlay').classList.add('flex');

    try {
        const response = await callGeminiAPI(currentImageBase64 || "audio_placeholder", itemData.prompt, currentItemId);
        showResultInModal(response);
        $('#loadingOverlay').classList.add('hidden');
        return response;
    } catch (error) {
        console.error("IA Analysis Error:", error);
        const errMock = { status: "Error", observation: "Error técnico. Por favor repite o valida manualmente.", detected_values: "" };
        showResultInModal(errMock);
        $('#loadingOverlay').classList.add('hidden');
        return errMock;
    }
}
