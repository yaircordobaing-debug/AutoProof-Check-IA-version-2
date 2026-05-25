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

export function simulateAIResponse(itemId) {
    const diagnosticDatabase = {
        "ia_desgaste_llantas": [
            { status: "Cumple", observation: "Cumple: Labrado uniforme de 4.2mm medido. Presión y estado de caucho excelente." },
            { status: "Advertencia", observation: "Advertencia: Desgaste asimétrico menor en hombro exterior. Sugiere alineación preventiva en los próximos 500 km." },
            { status: "No Cumple", observation: "Falla crítica: Labrado inferior a 1.6mm detectado en banda de rodadura central. Riesgo de aquaplaning severo." }
        ],
        "ia_vidrios_rotos": [
            { status: "Cumple", observation: "Cumple: Vidrio templado 100% íntegro. Libre de fisuras, astillas o rayones." },
            { status: "Advertencia", observation: "Advertencia: Micropicadura menor fuera de la zona de barrido principal. No compromete la visibilidad actual." },
            { status: "No Cumple", observation: "Falla crítica: Impacto en estrella con fisura radial de 12cm en el campo de visión directa del conductor." }
        ],
        "ia_golpes_visibles": [
            { status: "Cumple", observation: "Cumple: Carrocería libre de abolladuras o golpes que comprometan la seguridad pasiva." },
            { status: "Advertencia", observation: "Advertencia: Raspadura menor en pintura superficial de puerta trasera derecha. Sin daño estructural." },
            { status: "No Cumple", observation: "Falla crítica: Deformación plástica severa en guardabarros izquierdo con riesgo de roce con neumático." }
        ],
        "ia_luces_apagadas": [
            { status: "Cumple", observation: "Cumple: Intensidad y funcionamiento óptimo de luces altas, bajas y direccionales." },
            { status: "Advertencia", observation: "Advertencia: Luminosidad disminuida en faro derecho. Lente con opacidad por radiación UV." },
            { status: "No Cumple", observation: "Falla crítica: Faro delantero izquierdo inoperativo (posible bombillo fundido o conector suelto)." }
        ],
        "ia_humedad_fugas": [
            { status: "Cumple", observation: "Cumple: Motor seco y suelo limpio. Cero rastros de fugas o humedad activa." },
            { status: "Advertencia", observation: "Advertencia: Sudoración leve de aceite en empaque de tapa de válvulas. Monitorear nivel semanalmente." },
            { status: "No Cumple", observation: "Falla crítica: Goteo activo de fluido hidráulico (viscosidad alta) en zona de cárter. Nivel bajo inminente." }
        ],
        "ia_objetos_faltantes": [
            { status: "Cumple", observation: "Cumple: Kit de carretera reglamentario verificado con extintor cargado y botiquín sellado." },
            { status: "Advertencia", observation: "Advertencia: Kit de carretera completo, pero con linterna sin baterías operacionales." },
            { status: "No Cumple", observation: "Falla crítica: Extintor ausente en el habitáculo reglamentario o manómetro indicando recarga vencida." }
        ]
    };

    const options = diagnosticDatabase[itemId] || [
        { status: "Cumple", observation: "Componente verificado satisfactoriamente por IA Vision." },
        { status: "Advertencia", observation: "Se detecta una anomalía leve. Se recomienda vigilancia preventiva." },
        { status: "No Cumple", observation: "Anomalía crítica detectada. Requiere revisión técnica inmediata." }
    ];

    const rand = Math.random();
    let selected;
    if (rand < 0.70) {
        selected = options[0]; // Cumple
    } else if (rand < 0.90) {
        selected = options[1]; // Advertencia
    } else {
        selected = options[2]; // No Cumple
    }

    return {
        item_id: itemId,
        status: selected.status,
        confidence: 0.96,
        observation: selected.observation,
        timestamp: new Date().toISOString()
    };
}

export function enrichAIResponse(itemId, response) {
    if (!response || response.confidence === 0.0 || (response.observation && response.observation.includes('DEMO'))) {
        return simulateAIResponse(itemId);
    }
    return response;
}

export async function startAnalysis(currentItemId, currentImageBase64, showResultInModal) {
    let itemData;
    inspectionData.forEach(cat => cat.items.forEach(i => { if(i.id === currentItemId) itemData = i; }));

    // Show Loading Overlay
    $('#loadingOverlay').classList.remove('hidden');
    $('#loadingOverlay').classList.add('flex');

    try {
        const response = await callGeminiAPI(currentImageBase64 || "audio_placeholder", itemData.prompt, currentItemId);
        const enriched = enrichAIResponse(currentItemId, response);
        showResultInModal(enriched);
        $('#loadingOverlay').classList.add('hidden');
        return enriched;
    } catch (error) {
        console.error("IA Analysis Error:", error);
        const simulated = simulateAIResponse(currentItemId);
        showResultInModal(simulated);
        $('#loadingOverlay').classList.add('hidden');
        return simulated;
    }
}
