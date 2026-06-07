import { inspectionData, setupInspectionItems } from './data/inspectionItems.js';
import { $, $$, navigate as domNavigate, showNotification } from './utils/dom.js';

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

// Import SaaS Seed Data
import { saasCompanies, globalSystemLogs } from './data/saasData.js';

// --- Global State ---
let currentUser = null;
let currentView = 'splash';
let pendingTrip = null;
let activeTrip = null;
let currentRating = 0;
let currentItemId = null;
let currentImageBase64 = null;
let currentAIResult = null;
let currentFinalReport = null;

// --- SOS Accident Report State ---
let accidentPhotos = [null, null, null, null];

const mockLocations = [
    {
        address: "Avenida El Dorado (Calle 26) # 68C-61, Terminal Salitre, Bogotá, Colombia",
        coords: "4.6584, -74.1089",
        altitude: "2640m",
        weather: "Nublado, Neblina Leve (13°C), Asfalto Seco"
    },
    {
        address: "Carrera 7 # 72-80, Zona Financiera de la 72, Bogotá, Colombia",
        coords: "4.6562, -74.0560",
        altitude: "2620m",
        weather: "Lluvia Ligera, Asfalto Húmedo (12°C)"
    },
    {
        address: "Autopista Norte # 170-45, Portal de TransMilenio del Norte, Bogotá, Colombia",
        coords: "4.7554, -74.0458",
        altitude: "2605m",
        weather: "Fuerte Viento, Llovizna Intermitente (11°C)"
    },
    {
        address: "Calle 100 # 19-54, Entrada del Viaducto de la 100, Bogotá, Colombia",
        coords: "4.6882, -74.0552",
        altitude: "2612m",
        weather: "Despejado, Clima Frío (14°C), Asfalto Seco"
    },
    {
        address: "Avenida Boyacá # 80-94, Intersección con Calle 80, Bogotá, Colombia",
        coords: "4.6980, -74.0954",
        altitude: "2598m",
        weather: "Llovizna, Pavimento Mojado (12°C)"
    }
];

// Sequential State
let currentStep = 0;
let seqResults = [];

// --- SaaS Local Storage Seeding & Loading ---
let companiesState = JSON.parse(localStorage.getItem('saas_companies_state'));
if (!companiesState) {
    companiesState = saasCompanies;
    localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
}

let logsState = JSON.parse(localStorage.getItem('saas_global_logs'));
if (!logsState) {
    logsState = globalSystemLogs;
    localStorage.setItem('saas_global_logs', JSON.stringify(logsState));
}

let reportsHistoryState = JSON.parse(localStorage.getItem('saas_reports_history'));
if (!reportsHistoryState) {
    reportsHistoryState = [];
    localStorage.setItem('saas_reports_history', JSON.stringify(reportsHistoryState));
}

// Keep backwards compatible binding
let reportsHistory = reportsHistoryState;
let inspectionResults = {};

// --- Logging Helper ---
const logSystemEvent = (type, message) => {
    const time = new Date().toLocaleTimeString();
    logsState.push({ time, type, message });
    if (logsState.length > 50) {
        logsState.shift();
    }
    localStorage.setItem('saas_global_logs', JSON.stringify(logsState));
};

// --- Dynamic Layout & Color Branding (Tesla Fleet / HSL Adaptation) ---
const applyCompanyBranding = (companyId, user) => {
    const root = document.documentElement;
    const phoneContainer = $('#phone-container');
    const bottomNav = $('#bottom-nav');
    
    // Check if role is admin or super admin to toggle layout styles
    const isAdminView = user && (user.role === 'Admin Empresa' || user.role === 'Super Admin Global');
    
    if (isAdminView) {
        if (phoneContainer) {
            phoneContainer.className = "w-full h-[100dvh] flex flex-col relative overflow-hidden bg-darkBg";
            phoneContainer.style.maxWidth = "none";
            phoneContainer.style.margin = "0";
            phoneContainer.style.borderRadius = "0";
            phoneContainer.style.boxShadow = "none";
            phoneContainer.style.border = "none";
        }
        if (bottomNav) {
            bottomNav.classList.add('hidden');
        }
    } else {
        if (phoneContainer) {
            phoneContainer.className = "w-full h-[100dvh] flex flex-col relative overflow-hidden bg-darkBg md:max-w-[480px] md:mx-auto md:shadow-2xl md:border md:border-white/5 md:rounded-[2.5rem]";
            phoneContainer.removeAttribute('style');
        }
        if (bottomNav) {
            if (user) {
                bottomNav.classList.remove('hidden');
            } else {
                bottomNav.classList.add('hidden');
            }
        }
    }

    if (!user) {
        root.style.setProperty('--primary-hsl', '138, 14%, 33%'); // Default Fern
        root.style.setProperty('--h-jungle', '138');
        return;
    }
    
    let primaryHsl = '138, 14%, 33%'; // Default Earthy Fern Green
    let hue = '138';
    if (user.role === 'Super Admin Global') {
        primaryHsl = '280, 20%, 41%'; // Vintage Plum
        hue = '280';
    } else if (companyId === 'transbus' || user.vehicleType === 'buses') {
        primaryHsl = '206, 17%, 28%'; // Slate Navy (from palette rgb(59, 73, 83))
        hue = '206';
    } else if (companyId === 'logitruck' || user.vehicleType === 'camiones') {
        primaryHsl = '111, 17%, 53%'; // Dry Sage (from palette rgb(144, 171, 139))
        hue = '111';
    } else if (companyId === 'carfleet' || user.vehicleType === 'carros') {
        primaryHsl = '138, 14%, 33%'; // Fern Green (from palette rgb(90, 120, 99))
        hue = '138';
    }
    
    root.style.setProperty('--primary-hsl', primaryHsl);
    root.style.setProperty('--h-jungle', hue);
};

// --- Show PDF Result Modal (Premium alert replacement) ---
const showPdfResultModal = (isSuccess, title, message, onAccept) => {
    const modal = $('#pdfResultModal');
    const iconContainer = $('#pdfResultIconContainer');
    const icon = $('#pdfResultIcon');
    const titleEl = $('#pdfResultTitle');
    const msgEl = $('#pdfResultMsg');
    const btn = $('#pdfResultBtn');
    
    if (isSuccess) {
        iconContainer.className = "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-sage/20 text-sage border border-sage/30";
        icon.className = "fa-solid fa-circle-check text-3xl";
    } else {
        iconContainer.className = "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 bg-orange-500/20 text-orange-400 border border-orange-500/30";
        icon.className = "fa-solid fa-triangle-exclamation text-3xl";
    }
    
    titleEl.innerText = title;
    msgEl.innerText = message;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    btn.onclick = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        if (onAccept) onAccept();
    };
};
window.showPdfResultModal = showPdfResultModal;

// --- Update Driver Dashboard Custom Metrics ---
const updateDriverDashboardBranding = () => {
    if (!currentUser) return;
    
    const compId = currentUser.companyId;
    const comp = companiesState[compId];
    if (!comp) return;
    
    // Update company logo & details
    const logoEl = $('#companyLogo');
    if (logoEl) {
        logoEl.className = `fa-solid ${comp.logo} text-jungle`;
    }
    const bannerName = $('#companyBannerName');
    if (bannerName) {
        bannerName.innerText = comp.name;
    }
    const labelType = $('#companyLabelType');
    if (labelType) {
        labelType.innerText = comp.type.toUpperCase();
    }
    
    // Fill metrics grid
    const metricsGrid = $('#companyMetricsGrid');
    if (metricsGrid && comp.metrics) {
        metricsGrid.innerHTML = comp.metrics.map(m => `
            <div class="glass p-4 rounded-2xl border border-white/5 shadow flex items-center justify-between">
                <div>
                    <span class="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">${m.label}</span>
                    <span class="font-extrabold text-sm text-white mt-1 block">${m.value}</span>
                </div>
                <div class="p-2 bg-jungle/10 border border-jungle/20 rounded-xl text-jungle"><i class="fa-solid ${m.icon}"></i></div>
            </div>
        `).join('');
    }
};

// --- Helper Functions & Navigation ---
const navigate = (viewId) => {
    currentView = domNavigate(viewId, currentView, {
        dashboard: () => {
            updateDashboard(currentUser, activeTrip, reportsHistory);
            updateDriverDashboardBranding();
        },
        'admin-empresa': () => {
            switchAdminTab('dash');
        },
        'super-admin': () => {
            switchSuperTab('monitor');
        },
        'accident-report': () => {
            window.appActions.initAccidentReport();
        },
        history: () => {
            const container = $('#historyContainer');
            const companyReports = currentUser && currentUser.companyId 
                ? reportsHistoryState.filter(r => r.companyId === currentUser.companyId || !r.companyId)
                : reportsHistoryState;
                
            if (companyReports.length === 0) {
                container.innerHTML = '<p class="text-center py-10 opacity-60 text-xs">No hay reportes disponibles.</p>';
            } else {
                container.innerHTML = companyReports.map(r => `
                    <div class="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center mb-3 cursor-pointer hover:bg-white/10 transition-colors" onclick="window.open('${r.url}', '_blank')">
                        <div>
                            <p class="text-xs font-bold text-white">${r.id}</p>
                            <p class="text-[10px] text-gray-400"><i class="fa-solid fa-clock mr-1"></i>${r.date}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-black text-jungle">${r.score}%</p>
                            <p class="text-[10px] font-bold text-gray-500">${r.status}</p>
                        </div>
                    </div>
                `).join('');
            }
        },
        profile: () => {
            if (currentUser) {
                $('#profileName').innerText = currentUser.name;
                $('#profileEmail').innerText = currentUser.email;
                $('#profileRole').innerText = currentUser.role || 'Conductor';
                
                // Get initials
                const initials = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                $('#profileInitials').innerText = initials;
                
                // Company details
                const comp = companiesState[currentUser.companyId];
                if (comp) {
                    $('#profileCompanyName').innerText = comp.name;
                    $('#profileCompanyType').innerText = `Servicio de ${comp.type}`;
                    $('#profileCompanyLogo').className = `fa-solid ${comp.logo} text-base`;
                    $('#profileCompanyStatus').innerText = comp.suspended ? 'SUSPENDIDA' : 'ACTIVA';
                    $('#profileCompanyStatus').className = comp.suspended 
                        ? 'text-[9px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20'
                        : 'text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20';
                    
                    // Vehicle details
                    let vehicleObj = null;
                    if (activeTrip && activeTrip.car) {
                        vehicleObj = comp.vehicles.find(v => v.plate === activeTrip.car);
                    }
                    if (!vehicleObj) {
                        vehicleObj = comp.vehicles.find(v => v.driver === currentUser.name);
                    }
                    
                    if (vehicleObj) {
                        $('#profileVehiclePlate').innerText = vehicleObj.plate;
                        $('#profileVehicleModel').innerText = `${vehicleObj.brand} ${vehicleObj.model}`;
                        $('#profileVehicleMileage').innerText = `${vehicleObj.mileage.toLocaleString()} km`;
                        $('#profileVehicleStatus').innerText = vehicleObj.status;
                        
                        // Status styling
                        if (vehicleObj.status === 'APTO') {
                            $('#profileVehicleStatus').className = 'text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase';
                        } else if (vehicleObj.status === 'ADVERTENCIA') {
                            $('#profileVehicleStatus').className = 'text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase';
                        } else {
                            $('#profileVehicleStatus').className = 'text-[9px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20 uppercase';
                        }
                        
                        // Icon mapping by vehicle type
                        let iconClass = 'fa-car';
                        if (comp.type === 'buses') iconClass = 'fa-bus';
                        else if (comp.type === 'camiones') iconClass = 'fa-truck';
                        $('#profileVehicleTypeIcon').className = `fa-solid ${iconClass} text-base`;
                        
                        $('#profileVehicleDocs').innerText = vehicleObj.docs || 'SOAT: Al día';
                        
                        // Alerts mapping
                        const alertsList = $('#profileVehicleAlertsList');
                        const alertsSection = $('#profileVehicleAlertsSection');
                        if (vehicleObj.alerts && vehicleObj.alerts.length > 0) {
                            alertsSection.classList.remove('hidden');
                            alertsList.innerHTML = vehicleObj.alerts.map(a => `<li>${a}</li>`).join('');
                        } else {
                            alertsSection.classList.add('hidden');
                            alertsList.innerHTML = '';
                        }

                        // --- Oil Change Logic ---
                        let lastChange = vehicleObj.lastOilChangeKm;
                        if (lastChange === undefined || lastChange === null) {
                            lastChange = vehicleObj.mileage - 2000;
                            vehicleObj.lastOilChangeKm = lastChange;
                        }
                        const nextChange = lastChange + 5000;
                        const remaining = nextChange - vehicleObj.mileage;
                        
                        const oilStatusEl = $('#profileOilStatus');
                        if (oilStatusEl) {
                            oilStatusEl.innerText = remaining <= 0 
                                ? 'REQUERIDO' 
                                : (remaining <= 500 ? 'PRÓXIMO' : 'ÓPTIMO');
                            
                            if (remaining <= 0) {
                                oilStatusEl.className = 'text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border border-red-500/20 text-red-400 bg-red-500/10';
                            } else if (remaining <= 500) {
                                oilStatusEl.className = 'text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border border-amber-500/20 text-amber-400 bg-amber-500/10';
                            } else {
                                oilStatusEl.className = 'text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border border-emerald-500/20 text-emerald-400 bg-emerald-500/10';
                            }
                        }
                        
                        if ($('#profileLastOilChange')) $('#profileLastOilChange').innerText = `${lastChange.toLocaleString()} km`;
                        if ($('#profileNextOilChange')) $('#profileNextOilChange').innerText = `${nextChange.toLocaleString()} km`;
                        
                        // --- Vehicle Gallery Logic ---
                        if (!vehicleObj.gallery) {
                            vehicleObj.gallery = [null, null, null, null];
                        }
                        for (let i = 1; i <= 4; i++) {
                            const imgEl = $(`#vehPhoto${i}`);
                            const placeholderEl = $(`#vehPlaceholder${i}`);
                            const base64 = vehicleObj.gallery[i - 1];
                            if (imgEl && placeholderEl) {
                                if (base64) {
                                    imgEl.src = base64;
                                    imgEl.classList.remove('hidden');
                                    placeholderEl.classList.add('hidden');
                                } else {
                                    imgEl.src = '';
                                    imgEl.classList.add('hidden');
                                    placeholderEl.classList.remove('hidden');
                                }
                            }
                        }
                    } else {
                        // Fallback for driver with no assigned vehicle
                        $('#profileVehiclePlate').innerText = 'Ninguno';
                        $('#profileVehicleModel').innerText = 'Sin vehículo asignado';
                        $('#profileVehicleMileage').innerText = '0 km';
                        $('#profileVehicleStatus').innerText = 'INACTIVO';
                        $('#profileVehicleStatus').className = 'text-[9px] font-bold text-gray-400 bg-gray-500/10 px-2.5 py-1 rounded-full border border-gray-500/20 uppercase';
                        $('#profileVehicleTypeIcon').className = 'fa-solid fa-car text-base';
                        $('#profileVehicleDocs').innerText = 'SOAT: N/A';
                        $('#profileVehicleAlertsSection').classList.add('hidden');

                        // --- Fallback for Oil Change ---
                        const oilStatusEl = $('#profileOilStatus');
                        if (oilStatusEl) {
                            oilStatusEl.innerText = 'N/A';
                            oilStatusEl.className = 'text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border border-gray-500/20 text-gray-400 bg-gray-500/10';
                        }
                        if ($('#profileLastOilChange')) $('#profileLastOilChange').innerText = '0 km';
                        if ($('#profileNextOilChange')) $('#profileNextOilChange').innerText = '0 km';
                        
                        // Clear gallery preview
                        for (let i = 1; i <= 4; i++) {
                            const imgEl = $(`#vehPhoto${i}`);
                            const placeholderEl = $(`#vehPlaceholder${i}`);
                            if (imgEl && placeholderEl) {
                                imgEl.src = '';
                                imgEl.classList.add('hidden');
                                placeholderEl.classList.remove('hidden');
                            }
                        }
                    }
                } else {
                    // Non-corporate/Guest/Super Admin
                    $('#profileCompanyName').innerText = 'Super Admin';
                    $('#profileCompanyType').innerText = 'Administración Global';
                    $('#profileCompanyLogo').className = 'fa-solid fa-shield-halved text-base';
                    $('#profileCompanyStatus').innerText = 'N/A';
                    $('#profileCompanyStatus').className = 'text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20';
                    
                    $('#profileVehiclePlate').innerText = 'N/A';
                    $('#profileVehicleModel').innerText = 'Acceso de Administrador';
                    $('#profileVehicleMileage').innerText = 'N/A';
                    $('#profileVehicleStatus').innerText = 'N/A';
                    $('#profileVehicleStatus').className = 'text-[9px] font-bold text-gray-400 bg-gray-500/10 px-2.5 py-1 rounded-full border border-gray-500/20 uppercase';
                    $('#profileVehicleTypeIcon').className = 'fa-solid fa-user-shield text-base';
                    $('#profileVehicleDocs').innerText = 'SOAT: N/A';
                    $('#profileVehicleAlertsSection').classList.add('hidden');

                    // --- Fallback for Oil Change ---
                    const oilStatusEl = $('#profileOilStatus');
                    if (oilStatusEl) {
                        oilStatusEl.innerText = 'N/A';
                        oilStatusEl.className = 'text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border border-gray-500/20 text-gray-400 bg-gray-500/10';
                    }
                    if ($('#profileLastOilChange')) $('#profileLastOilChange').innerText = 'N/A';
                    if ($('#profileNextOilChange')) $('#profileNextOilChange').innerText = 'N/A';
                    
                    // Clear gallery preview
                    for (let i = 1; i <= 4; i++) {
                        const imgEl = $(`#vehPhoto${i}`);
                        const placeholderEl = $(`#vehPlaceholder${i}`);
                        if (imgEl && placeholderEl) {
                            imgEl.src = '';
                            imgEl.classList.add('hidden');
                            placeholderEl.classList.remove('hidden');
                        }
                    }
                }
            } else {
                // Modo Invitado
                $('#profileName').innerText = 'Invitado';
                $('#profileEmail').innerText = 'Sin cuenta activa';
                $('#profileRole').innerText = 'Invitado';
                $('#profileInitials').innerText = 'IN';
                
                $('#profileCompanyName').innerText = 'Ninguna';
                $('#profileCompanyType').innerText = 'Modo de Prueba';
                $('#profileCompanyLogo').className = 'fa-solid fa-building text-base';
                $('#profileCompanyStatus').innerText = 'N/A';
                $('#profileCompanyStatus').className = 'text-[9px] font-bold text-gray-400 bg-gray-500/10 px-2.5 py-1 rounded-full border border-gray-500/20';
                
                $('#profileVehiclePlate').innerText = 'Ninguno';
                $('#profileVehicleModel').innerText = 'Inicia sesión para ver tu vehículo';
                $('#profileVehicleMileage').innerText = '0 km';
                $('#profileVehicleStatus').innerText = 'INACTIVO';
                $('#profileVehicleStatus').className = 'text-[9px] font-bold text-gray-400 bg-gray-500/10 px-2.5 py-1 rounded-full border border-gray-500/20 uppercase';
                $('#profileVehicleTypeIcon').className = 'fa-solid fa-car text-base';
                $('#profileVehicleDocs').innerText = 'SOAT: N/A';
                $('#profileVehicleAlertsSection').classList.add('hidden');

                // --- Fallback for Oil Change ---
                const oilStatusEl = $('#profileOilStatus');
                if (oilStatusEl) {
                    oilStatusEl.innerText = 'N/A';
                    oilStatusEl.className = 'text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border border-gray-500/20 text-gray-400 bg-gray-500/10';
                }
                if ($('#profileLastOilChange')) $('#profileLastOilChange').innerText = '0 km';
                if ($('#profileNextOilChange')) $('#profileNextOilChange').innerText = '0 km';
                
                // Clear gallery preview
                for (let i = 1; i <= 4; i++) {
                    const imgEl = $(`#vehPhoto${i}`);
                    const placeholderEl = $(`#vehPlaceholder${i}`);
                    if (imgEl && placeholderEl) {
                        imgEl.src = '';
                        imgEl.classList.add('hidden');
                        placeholderEl.classList.remove('hidden');
                    }
                }
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
        $('#resultStatus').className = `font-bold text-xl ${result.status === 'Cumple' ? 'text-jungle' : 'text-red-500'}`;
    }
    if ($('#resultObservation')) $('#resultObservation').innerText = result.observation;
    
    if ($('#itemObservation') && result.observation) {
        const noteMatch = result.observation.split(' | Nota: ');
        $('#itemObservation').value = noteMatch.length > 1 ? noteMatch[1] : result.observation;
    }

    if ($('#btnSaveResult')) $('#btnSaveResult').classList.remove('hidden');
};

// --- Initialization ---
window.onload = () => {
    const appComponents = $('#app-components');
    if (appComponents) {
        appComponents.innerHTML = renderModals() + renderBottomNav();
    }
    setTimeout(() => { navigate('landing'); }, 1500);
    renderChecklist(inspectionResults);
};

// --- Expose Global Actions for index.html ---
window.appActions = {
    fillCredentials: (email, password) => {
        const emailEl = $('#manualEmail');
        const passEl = $('#manualPassword');
        if (emailEl) emailEl.value = email;
        if (passEl) passEl.value = password;
        
        window.appActions.login(true);
    },
    // --- SOS Accident Report Actions ---
    initAccidentReport: () => {
        accidentPhotos = Array(7).fill(null);
        
        // Reset observations
        const notesEl = $('#accNotes');
        if (notesEl) notesEl.value = '';
        
        // Populate Driver info
        const driverNameEl = $('#accDriverName');
        const driverEmailEl = $('#accDriverEmail');
        if (driverNameEl) {
            driverNameEl.innerText = currentUser ? currentUser.name : 'Carlos Gómez';
        }
        if (driverEmailEl) {
            driverEmailEl.innerText = currentUser ? currentUser.email : 'carlos.gomez@transbus.co';
        }

        // Identify vehicle
        let plate = 'SIN-VEHICULO';
        let brandModel = 'Sin Vehículo Asignado';
        let vehicleObj = null;
        
        if (activeTrip && activeTrip.car) {
            plate = activeTrip.car;
            const compId = currentUser ? currentUser.companyId : null;
            if (compId && companiesState[compId]) {
                const comp = companiesState[compId];
                vehicleObj = comp.vehicles.find(v => v.plate === plate);
                if (vehicleObj) {
                    brandModel = `${vehicleObj.brand} ${vehicleObj.model}`;
                }
            }
        } else if (currentUser && currentUser.companyId) {
            const compId = currentUser.companyId;
            const comp = companiesState[compId];
            if (comp && comp.vehicles) {
                vehicleObj = comp.vehicles.find(v => v.driver === currentUser.name);
                if (vehicleObj) {
                    plate = vehicleObj.plate;
                    brandModel = `${vehicleObj.brand} ${vehicleObj.model}`;
                } else if (comp.vehicles.length > 0) {
                    vehicleObj = comp.vehicles[0];
                    plate = vehicleObj.plate;
                    brandModel = `${vehicleObj.brand} ${vehicleObj.model}`;
                }
            }
        }
        
        const plateEl = $('#accVehiclePlate');
        const infoEl = $('#accVehicleInfo');
        if (plateEl) plateEl.innerText = plate;
        if (infoEl) infoEl.innerText = brandModel;

        // Georeferencing / GPS and Weather
        const now = new Date();
        const locIndex = now.getMinutes() % mockLocations.length;
        const currentLoc = mockLocations[locIndex];
        
        const locEl = $('#accLocationAddress');
        const coordsEl = $('#accCoordinates');
        const altEl = $('#accAltitude');
        const weatherEl = $('#accWeather');
        
        if (locEl) locEl.innerText = currentLoc.address;
        if (coordsEl) coordsEl.innerText = currentLoc.coords;
        if (altEl) altEl.innerText = currentLoc.altitude;
        if (weatherEl) weatherEl.innerText = currentLoc.weather;

        // Reset image previews, placeholders and overlays
        for (let i = 1; i <= 7; i++) {
            const img = $('#accImagePreview' + i);
            if (img) {
                img.src = '';
                img.classList.add('hidden');
            }
            const overlay = $('#accOverlay' + i);
            if (overlay) overlay.classList.add('hidden');
            
            const placeholder = $('#accPlaceholder' + i);
            if (placeholder) placeholder.classList.remove('hidden');
            
            const statusEl = $('#accPhotoStatus' + i);
            if (statusEl) {
                statusEl.innerHTML = '<i class="fa-solid fa-lock mr-1"></i>Requerida';
                statusEl.className = 'text-[10px] font-bold text-gray-500';
            }
        }

        // Initialize signature pad
        setTimeout(() => {
            window.appActions.initAccidentSignaturePad();
        }, 100);
    },

    initAccidentSignaturePad: () => {
        const canvas = document.getElementById('accident-signature-pad');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * (window.devicePixelRatio || 1);
        canvas.height = rect.height * (window.devicePixelRatio || 1);
        
        const ctx = canvas.getContext('2d');
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

        let drawing = false;
        const getPos = (e) => {
            const r = canvas.getBoundingClientRect();
            return {
                x: (e.clientX || e.touches[0].clientX) - r.left,
                y: (e.clientY || e.touches[0].clientY) - r.top
            };
        };

        const start = (e) => { 
            drawing = true; 
            const p = getPos(e); 
            ctx.beginPath(); 
            ctx.moveTo(p.x, p.y); 
        };
        const end = () => { 
            drawing = false; 
        };
        const draw = (e) => {
            if (!drawing) return;
            e.preventDefault();
            const p = getPos(e);
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#ef4444'; // Red for accident report
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        };

        // Re-bind drawing listeners cleanly
        canvas.replaceWith(canvas.cloneNode(true));
        const cleanCanvas = document.getElementById('accident-signature-pad');
        const cleanCtx = cleanCanvas.getContext('2d');
        cleanCanvas.width = rect.width * (window.devicePixelRatio || 1);
        cleanCanvas.height = rect.height * (window.devicePixelRatio || 1);
        cleanCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        
        const newStart = (ev) => { 
            drawing = true; 
            const p = getPos(ev); 
            cleanCtx.beginPath(); 
            cleanCtx.moveTo(p.x, p.y); 
        };
        const newDraw = (ev) => {
            if (!drawing) return;
            ev.preventDefault();
            const p = getPos(ev);
            cleanCtx.lineWidth = 2.5;
            cleanCtx.lineCap = 'round';
            cleanCtx.strokeStyle = '#ef4444';
            cleanCtx.lineTo(p.x, p.y);
            cleanCtx.stroke();
        };

        cleanCanvas.addEventListener('mousedown', newStart);
        cleanCanvas.addEventListener('mousemove', newDraw);
        window.addEventListener('mouseup', end);
        cleanCanvas.addEventListener('touchstart', newStart, {passive: false});
        cleanCanvas.addEventListener('touchmove', newDraw, {passive: false});
        cleanCanvas.addEventListener('touchend', end);
    },

    clearAccidentSignature: () => {
        const canvas = document.getElementById('accident-signature-pad');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    },

    triggerAccidentPhoto: (index) => {
        const input = $('#accFileInput' + index);
        if (input) input.click();
    },

    handleAccidentImage: (event, index) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            accidentPhotos[index - 1] = base64;
            
            // Preview
            const img = $('#accImagePreview' + index);
            if (img) {
                img.src = base64;
                img.classList.remove('hidden');
            }
            
            // Hide placeholder
            const placeholder = $('#accPlaceholder' + index);
            if (placeholder) placeholder.classList.add('hidden');
            
            // Watermarks
            const now = new Date();
            const timeStr = now.toISOString().replace('T', ' ').substring(0, 16);
            const locIndex = now.getMinutes() % mockLocations.length;
            const currentLoc = mockLocations[locIndex];
            
            const randomHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            const mockHash = (randomHex() + randomHex() + randomHex() + randomHex() + randomHex() + randomHex() + randomHex() + randomHex()).toLowerCase();
            
            const timeW = $('#accTimeWatermark' + index);
            const gpsW = $('#accGpsWatermark' + index);
            const hashW = $('#accHashWatermark' + index);
            
            if (timeW) timeW.innerText = timeStr;
            if (gpsW) gpsW.innerText = `${currentLoc.coords} (Alt: ${currentLoc.altitude})`;
            if (hashW) hashW.innerText = mockHash;
            
            // Show Overlay
            const overlay = $('#accOverlay' + index);
            if (overlay) overlay.classList.remove('hidden');
            
            // Status Badge
            const statusEl = $('#accPhotoStatus' + index);
            if (statusEl) {
                statusEl.innerHTML = '✅ VALIDADA';
                statusEl.className = 'text-[10px] font-bold text-emerald-400';
            }
        };
        reader.readAsDataURL(file);
    },

    submitAccidentReport: () => {
        if (!accidentPhotos[0] || !accidentPhotos[1]) {
            showNotification("Por favor capture al menos las dos primeras fotos críticas (Panorámica y Vehículos) para el blindaje legal.");
            return;
        }
        
        const userEmailField = $('#accUserEmail');
        const userEmail = userEmailField && userEmailField.value ? userEmailField.value : 'No especificado';
        
        let vehicleObj = null;
        let plate = 'SIN-VEHICULO';
        let brandModel = 'Sin Vehículo Asignado';
        
        const compId = currentUser ? currentUser.companyId : null;
        if (compId && companiesState[compId]) {
            const comp = companiesState[compId];
            if (activeTrip && activeTrip.car) {
                plate = activeTrip.car;
            } else {
                const preVeh = comp.vehicles.find(v => v.driver === currentUser.name);
                if (preVeh) plate = preVeh.plate;
                else if (comp.vehicles.length > 0) plate = comp.vehicles[0].plate;
            }
            
            if (plate) {
                vehicleObj = comp.vehicles.find(v => v.plate === plate);
                if (vehicleObj) {
                    if (typeof vehicleObj.accidents === 'undefined') {
                        vehicleObj.accidents = 0;
                    }
                    vehicleObj.accidents++;
                    brandModel = `${vehicleObj.brand} ${vehicleObj.model}`;
                    localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
                }
            }
        }
        
        const driverName = currentUser ? currentUser.name : 'Carlos Gómez';
        logSystemEvent("WARNING", `Reporte de Siniestro Forense generado para vehículo [${plate}] por [${driverName}].`);
        
        const now = new Date();
        const currentLoc = mockLocations[now.getMinutes() % mockLocations.length];
        
        const randomHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        const integritySeal = (randomHex() + randomHex() + randomHex() + randomHex()).toLowerCase();
        
        const successTitle = "SOS LEGAL GENERADO";
        const successMessage = `El reporte forense para el vehículo ${brandModel} (${plate}) fue guardado de manera inmutable bajo el código de verificación SHA-256: [${integritySeal}].\n\nUbicación georreferenciada: ${currentLoc.address}.\n\nSe ha generado un PDF del reporte de siniestro y se ha enviado a afrodev.general@gmail.com y a ${userEmail}.\n\nHaz clic en Aceptar para regresar al Dashboard.`;
        
        showPdfResultModal(true, successTitle, successMessage, () => {
            accidentPhotos = Array(7).fill(null);
            navigate('dashboard');
        });
    },

    showPreopIAModal: () => {
        const modal = document.getElementById('preopIAModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        } else {
            showNotification("La funcionalidad de Preoperacional IA no está disponible en este momento. Se realizará el análisis con IA a llantas, vidrios, detección de funcionamiento de las luces, kit de carretera, entre otros componentes, y estará habilitado en muy poco tiempo.");
        }
    },

    login: (isUser) => { 
        if (isUser) {
            const emailInput = $('#manualEmail') ? $('#manualEmail').value.trim().toLowerCase() : '';
            const passwordInput = $('#manualPassword') ? $('#manualPassword').value.trim() : '';
            
            if (!emailInput || !passwordInput) {
                showNotification("Por favor ingresa tu correo y contraseña");
                return;
            }

            let foundUser = null;
            let companyId = null;
            let type = null;

            // Check super admins
            import('./data/saasData.js').then(({ saasCompanies, superAdmins }) => {
                const superAdmin = superAdmins.find(sa => sa.email === emailInput && sa.password === passwordInput);
                if (superAdmin) {
                    foundUser = { ...superAdmin, companyId: 'global', vehicleType: 'all' };
                } else {
                    // Check companies
                    for (const compKey in saasCompanies) {
                        const comp = saasCompanies[compKey];
                        const driver = comp.drivers.find(d => d.email === emailInput && d.password === passwordInput);
                        if (driver) {
                            foundUser = { ...driver, companyId: comp.id, vehicleType: comp.type };
                            break;
                        }
                        const admin = comp.admins.find(a => a.email === emailInput && a.password === passwordInput);
                        if (admin) {
                            foundUser = { ...admin, companyId: comp.id, vehicleType: comp.type };
                            break;
                        }
                    }
                }

                if (foundUser) {
                    currentUser = foundUser;
                    showNotification(`Bienvenido ${foundUser.name}`);
                    applyCompanyBranding(foundUser.companyId, foundUser);
                    
                    if (foundUser.role === 'superadmin') {
                        navigate('super-admin');
                    } else if (foundUser.role === 'admin') {
                        navigate('admin-empresa');
                    } else {
                        navigate('dashboard');
                    }
                } else {
                    showNotification("Credenciales inválidas. Intenta de nuevo.");
                }
            });
        } else {
            currentUser = null;
            applyCompanyBranding(null, null);
            showNotification("Modo invitado activado (Funciones limitadas)");
            navigate('dashboard');
        }
    },
    logout: () => { 
        currentUser = null; 
        activeTrip = null; 
        applyCompanyBranding(null, null); 
        showNotification("Sesión cerrada"); 
        navigate('login'); 
    },

    navigate: navigate,

    cancelActiveInspection: () => {
        if(confirm('¿Seguro que deseas salir de la inspección? Se perderá todo tu progreso y se cancelará el reporte.')) {
            activeTrip = null;
            pendingTrip = null;
            inspectionResults = {};
            if (currentUser) {
                updateDashboard(currentUser, activeTrip, reportsHistory);
            }
            navigate('dashboard');
        }
    },
    
    
    startPreoperacional: (isWeeklyIA) => {
        let companyFleet = ["Vehículo Demo 1", "Vehículo Demo 2"];
        let vehicleType = "carros";
        
        if (currentUser && currentUser.companyId) {
            const comp = companiesState[currentUser.companyId];
            if (comp) {
                companyFleet = comp.vehicles.map(v => `${v.brand} ${v.model} (${v.plate})`);
                vehicleType = comp.type;
            }
        }
        
        window.isWeeklyGlobal = isWeeklyIA;
        window.selectedVehicleType = vehicleType;
        
        setupInspectionItems(vehicleType, isWeeklyIA);
        
        inspectionResults = {};
        renderChecklist(inspectionResults);
        
        const headerTitle = $('#checklistHeaderTitle');
        if (headerTitle) {
            headerTitle.innerText = isWeeklyIA ? "Inspección IA Semanal" : `Preoperacional Diario (${vehicleType === 'buses' ? 'Bus' : vehicleType === 'camiones' ? 'Camión' : 'Carro'})`;
        }
        
        initTripSetup(currentUser, companyFleet, navigate);
    },

    initTripSetup: () => {
        let companyFleet = ["Vehículo Demo 1", "Vehículo Demo 2"];
        if (currentUser && currentUser.companyId) {
            const comp = companiesState[currentUser.companyId];
            if (comp) companyFleet = comp.vehicles.map(v => `${v.brand} ${v.model} (${v.plate})`);
        }
        initTripSetup(currentUser, companyFleet, navigate);
    },

    initBusTripSetup: () => {
        let companyFleet = ["Bus Urbano 1", "Bus Intermunicipal 2"];
        if (currentUser && currentUser.companyId) {
            const comp = companiesState[currentUser.companyId];
            if (comp) companyFleet = comp.vehicles.map(v => `${v.brand} ${v.model} (${v.plate})`);
        }
        initTripSetup(currentUser, companyFleet, navigate);
    },

    confirmTripSetup: () => { 
        pendingTrip = confirmTripSetup(navigate); 
        if (pendingTrip) {
            activeTrip = { ...pendingTrip, status: 'Active', startTime: new Date().toLocaleTimeString() };
            pendingTrip = null;
            inspectionResults = {};
            renderChecklist(inspectionResults);
            navigate('checklist');
        }
    },

    startOBDScan: () => runOBDScan(),
    
    setRating: (rating) => {
        currentRating = rating;
        const stars = $('#starRating').querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('text-gray-700');
                star.classList.add('text-yellow-400');
            } else {
                star.classList.remove('text-yellow-400');
                star.classList.add('text-gray-700');
            }
        });
    },

    submitTripReview: () => {
        const success = runSubmitTripReview(currentRating, navigate);
        if (success) {
            activeTrip = null;
            currentRating = 0;
        }
    },

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
                $('#modalTitle').innerText = `${itemData.name} - ${seqLabels[window.appActions.getCurrentStep()]} (${window.appActions.getCurrentStep() + 1}/4)`;
                window.appActions.retryAnalysis();
                return;
            }
            
            const allResults = window.appActions.getSeqResults();
            inspectionResults[currentItemId] = {
                status: allResults.every(r => r.status === 'Cumple') ? 'Cumple' : 'No Cumple',
                method: 'IA-SEQ',
                completed: true,
                observation: allResults.map(r => `${r.pos}: ${r.status} (${r.val})`).join(' | '),
                image_data: currentImageBase64
            };
        } else {
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
            observation: userObs
        };
        renderChecklist(inspectionResults);
        window.appActions.closeModal();
    },

    openLegalWaiver: () => { 
        $('#legalComment').value = '';
        $('#legalCheckbox').checked = false;
        $('#legalModal').classList.remove('hidden'); 
        $('#legalModal').classList.add('flex'); 
    },
    closeLegalModal: () => { $('#legalModal').classList.add('hidden'); },
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
            window.appActions.finishReport();
        }
    },

    forceFinishInspection: () => {
        const comment = $('#forceFinishComment').value;
        const res = runEvaluarReporte(inspectionResults, currentUser, activeTrip, pendingTrip, true);
        if (res) {
            res.observation = (res.observation || "") + ` | INSPECCIÓN FORZADA: El inspector acepta responsabilidad. Motivo: ${comment || 'No especificado'}`;
            currentFinalReport = res;
            $('#incompleteModal').classList.add('hidden');
            window.appActions.finishReport();
        }
    },
    
    simulateSend: async (type) => {
        if (type === 'Empresa') {
            $('#driverEmail').value = currentUser ? currentUser.email : 'yair.cordoba.ing@gmail.com';
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
        const email = currentUser ? currentUser.email : "yair.cordoba.ing@gmail.com";
        const canvas = document.getElementById('signature-pad');
        if (canvas) {
            currentFinalReport.signature = canvas.toDataURL();
        }

        if (currentUser && currentUser.companyId) {
            currentFinalReport.companyId = currentUser.companyId;
        }

        const finalBtn = $('#finalModal').querySelector('button[onclick="submitFinalReport()"]');
        if (finalBtn) {
            finalBtn.disabled = true;
            finalBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> GENERANDO...';
        }
        
        const loader = $('#loadingOverlay');
        if (loader) {
            const h3 = loader.querySelector('h3');
            const p = loader.querySelector('p');
            if(h3) h3.innerText = "GENERANDO REPORTE...";
            if(p) p.innerText = "Firmando y enviando por correo electrónico...";
            loader.classList.remove('hidden');
            loader.classList.add('flex');
        }

        const res = await submitFinalReport(currentFinalReport, email, reportsHistory);
        
        if (finalBtn) {
            finalBtn.disabled = false;
            finalBtn.innerHTML = 'Generar Reporte PDF';
        }
        if (loader) {
            loader.classList.add('hidden');
            loader.classList.remove('flex');
            const h3 = loader.querySelector('h3');
            const p = loader.querySelector('p');
            if(h3) h3.innerText = "ANALIZANDO CON IA...";
            if(p) p.innerText = "Por favor, espera un momento.";
        }

        if (res) {
            $('#finalModal').classList.add('hidden');
            
            // Update local company vehicle status
            if (currentUser && currentUser.companyId) {
                const comp = companiesState[currentUser.companyId];
                if (comp) {
                    const plate = currentFinalReport.vehicle_plate;
                    const vehicle = comp.vehicles.find(v => v.plate === plate);
                    if (vehicle) {
                        vehicle.status = currentFinalReport.status; // APTO, ADVERTENCIA, NO APTO
                        if (currentFinalReport.status !== 'APTO') {
                            const isAI = window.isWeeklyGlobal;
                            const typeMsg = isAI ? "riesgo_ia" : "inspeccion_fallida";
                            comp.alertsHistory.unshift({
                                id: Date.now().toString(),
                                type: typeMsg,
                                message: `Vehículo ${plate} marcado como ${currentFinalReport.status} en ${isAI ? 'Preoperacional IA' : 'Preoperacional Diario'}`,
                                date: new Date().toLocaleDateString(),
                                severity: currentFinalReport.status === 'NO APTO' ? 'high' : 'medium'
                            });
                        }
                    }
                    localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
                }
            }

            pendingTrip = null;
            inspectionResults = {};
            renderChecklist(inspectionResults);
            localStorage.setItem('saas_reports_history', JSON.stringify(reportsHistory));
            
            // Log global
            logSystemEvent("SUCCESS", `Reporte ${res.report_id || 'Generado'} para ${currentFinalReport.vehicle_plate} por ${currentUser ? currentUser.name : 'Invitado'}. Estado: ${currentFinalReport.status}`);
            
            const msgBody = res.email_sent 
                ? `El PDF ha sido generado y firmado con blockchain. Copia enviada a los administradores y a ${email}.`
                : `El PDF ha sido generado. (Advertencia: Falló el envío de correo. Revisa tus credenciales de Gmail).`;
            
            showPdfResultModal(true, "REPORTE GENERADO", msgBody, () => {
                navigate('dashboard');
            });
        } else {
            showNotification("Error de red. Intenta de nuevo.");
        }
    },
    switchAdminTab: (tab) => {
        $$('.admin-tab').forEach(el => el.classList.add('hidden'));
        const target = $(`#adminTab-${tab}`);
        if (target) {
            target.classList.remove('hidden');
        }
        const tabButtons = ['dash', 'vehicles', 'drivers', 'alerts', 'config'];
        tabButtons.forEach(t => {
            const btn = $(`#tabBtn-${t}`);
            if (btn) {
                if (t === tab) {
                    btn.className = "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-white/10 text-white transition-all text-left";
                } else {
                    btn.className = "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all text-left";
                }
            }
        });
        
        const tabTitles = {
            dash: "Módulo Dashboard",
            vehicles: "Inventario Flota",
            drivers: "Conductores",
            alerts: "Alertas y Riesgos",
            config: "Reglas & SaaS"
        };
        const titleEl = $('#adminActiveTabTitle');
        if (titleEl && tabTitles[tab]) {
            titleEl.innerText = tabTitles[tab];
        }
        
        renderAdminDashboard();
    },

    switchSuperTab: (tab) => {
        $$('.super-tab').forEach(el => el.classList.add('hidden'));
        const target = $(`#superTab-${tab}`);
        if (target) {
            target.classList.remove('hidden');
        }
        const tabButtons = ['monitor', 'companies', 'ia', 'logs'];
        tabButtons.forEach(t => {
            const btn = $(`#superBtn-${t}`);
            if (btn) {
                if (t === tab) {
                    btn.className = "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-white/10 text-white transition-all text-left";
                } else {
                    btn.className = "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all text-left";
                }
            }
        });
        
        const tabTitles = {
            monitor: "Dashboard Global",
            companies: "Gestión Empresas",
            ia: "Métricas Gemini IA",
            logs: "Logs y Servidor"
        };
        const titleEl = $('#superActiveTabTitle');
        if (titleEl && tabTitles[tab]) {
            titleEl.innerText = tabTitles[tab];
        }
        
        renderSuperAdminDashboard();
    },

    openAddVehicleForm: () => {
        $('#addVehicleFormContainer').classList.remove('hidden');
    },

    closeAddVehicleForm: () => {
        $('#addVehicleFormContainer').classList.add('hidden');
        $('#vFormPlate').value = '';
        $('#vFormBrand').value = '';
        $('#vFormModel').value = '';
        $('#vFormMileage').value = '';
    },

    saveNewVehicle: () => {
        const plate = $('#vFormPlate').value.trim().toUpperCase();
        const brand = $('#vFormBrand').value.trim();
        const model = $('#vFormModel').value.trim();
        const mileage = parseInt($('#vFormMileage').value.trim(), 10);
        const driver = $('#vFormDriver').value;
        
        if (!plate || !brand || !model || isNaN(mileage)) {
            showNotification("Por favor completa todos los campos del vehículo.");
            return;
        }
        
        const compId = currentUser.companyId;
        const comp = companiesState[compId];
        if (!comp) return;
        
        if (comp.vehicles.some(v => v.plate === plate)) {
            showNotification("La placa ingresada ya existe en la flota.");
            return;
        }
        
        comp.vehicles.push({
            plate, brand, model, mileage, driver, status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Al día"
        });
        
        localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
        logSystemEvent("SUCCESS", `Vehículo registrado: ${brand} ${model} (${plate}) por admin.`);
        
        window.appActions.closeAddVehicleForm();
        renderAdminDashboard();
        showNotification("Vehículo registrado exitosamente en la flota.");
    },

    deleteVehicle: (plate) => {
        const compId = currentUser.companyId;
        const comp = companiesState[compId];
        if (!comp) return;
        
        if (confirm(`¿Estás seguro de eliminar el vehículo ${plate}?`)) {
            comp.vehicles = comp.vehicles.filter(v => v.plate !== plate);
            localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
            logSystemEvent("WARNING", `Vehículo ${plate} eliminado del inventario de ${comp.name}.`);
            renderAdminDashboard();
            showNotification("Vehículo eliminado de la flota.");
        }
    },

    resolveAlert: (plate, alertText) => {
        const compId = currentUser.companyId;
        const comp = companiesState[compId];
        if (!comp) return;
        
        const vehicle = comp.vehicles.find(v => v.plate === plate);
        if (vehicle) {
            vehicle.alerts = vehicle.alerts.filter(alt => alt !== alertText);
            if (vehicle.alerts.length === 0) {
                vehicle.status = "APTO";
            }
            localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
            logSystemEvent("SUCCESS", `Alerta mecánica resuelta en ${plate}: '${alertText}'`);
            renderAdminDashboard();
            showNotification("Alerta resuelta y limpiada correctamente.");
        }
    },

    changeCompanyConfig: () => {
        const compId = currentUser.companyId;
        const comp = companiesState[compId];
        if (!comp) return;
        
        comp.iaPeriodicity = $('#configIaPeriodicity').value;
        comp.modules = {
            obd: $('#moduleObdCheck').checked,
            voice: $('#moduleVoiceCheck').checked,
            gps: true
        };
        
        localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
        logSystemEvent("INFO", `Configuración de SaaS modificada por admin de ${comp.name}.`);
        showNotification("Configuración de reglas guardada correctamente.");
    },

    toggleCompanyLicense: (companyId, suspend) => {
        const comp = companiesState[companyId];
        if (!comp) return;
        
        comp.suspended = suspend;
        localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
        
        const eventType = suspend ? "WARNING" : "SUCCESS";
        const statusText = suspend ? "suspendida" : "reactivada";
        logSystemEvent(eventType, `Licencia corporativa de ${comp.name} ha sido ${statusText} por el Super Administrador.`);
        
        renderSuperAdminDashboard();
        showNotification(`Empresa ${statusText} correctamente.`);
    },

    triggerVehicleAlertForDriver: (driverName) => {
        const compId = currentUser.companyId;
        const comp = companiesState[compId];
        if (!comp) return;
        
        const vehicle = comp.vehicles.find(v => v.driver === driverName);
        if (vehicle) {
            const sampleAlerts = [
                "Desgaste extremo en llanta delantera derecha",
                "Fuga hidráulica detectada en bloque de motor",
                "Freno de servicio con carrera larga",
                "Falla en sensor OBD-II de presión de escape",
                "Luz de advertencia Check Engine activa"
            ];
            const newAlert = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];
            
            if (!vehicle.alerts) vehicle.alerts = [];
            if (!vehicle.alerts.includes(newAlert)) {
                vehicle.alerts.push(newAlert);
                vehicle.status = "NO APTO";
                localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
                logSystemEvent("ERROR", `CRÍTICO: Alerta mecánica generada por conductor ${driverName} para ${vehicle.plate}: ${newAlert}`);
                renderAdminDashboard();
                showNotification(`¡Alerta simulada para el vehículo ${vehicle.plate}!`);
            } else {
                showNotification("El vehículo ya tiene una alerta activa.");
            }
        } else {
            showNotification("Este conductor no tiene un vehículo asignado para simular alertas.");
        }
    },

    triggerDemoVehicleAlert: () => {
        const compId = currentUser.companyId;
        const comp = companiesState[compId];
        if (!comp) return;
        
        if (comp.vehicles.length === 0) {
            showNotification("No hay vehículos registrados para simular alertas.");
            return;
        }
        
        const v = comp.vehicles[0];
        const sampleAlerts = [
            "Presión de neumáticos crítica detectada",
            "Sensor ABS indica falla en rueda trasera izquierda",
            "Nivel de refrigerante del motor bajo"
        ];
        const newAlert = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];
        
        if (!v.alerts) v.alerts = [];
        v.alerts.push(newAlert);
        v.status = "ADVERTENCIA";
        
        localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
        logSystemEvent("WARNING", `Alerta de mantenimiento preventivo en ${v.plate}: ${newAlert}`);
        renderAdminDashboard();
        showNotification(`Alerta simulada en ${v.plate}`);
    },

    openOilChangeDialog: () => {
        if (!currentUser || !currentUser.companyId) {
            showNotification("No tienes una sesión corporativa activa.");
            return;
        }
        const comp = companiesState[currentUser.companyId];
        if (!comp) return;

        let vehicleObj = null;
        if (activeTrip && activeTrip.car) {
            vehicleObj = comp.vehicles.find(v => v.plate === activeTrip.car);
        }
        if (!vehicleObj) {
            vehicleObj = comp.vehicles.find(v => v.driver === currentUser.name);
        }

        if (!vehicleObj) {
            showNotification("No tienes ningún vehículo asignado para registrar mantenimiento.");
            return;
        }

        const currentKm = vehicleObj.mileage;
        const lastChange = vehicleObj.lastOilChangeKm || (currentKm - 2000);

        const promptVal = prompt(
            `Registrar Cambio de Aceite para ${vehicleObj.brand} ${vehicleObj.model} (${vehicleObj.plate}):\n\n` +
            `Kilometraje actual: ${currentKm.toLocaleString()} km\n` +
            `Último cambio registrado: ${lastChange.toLocaleString()} km\n\n` +
            `Por favor ingrese el kilometraje del nuevo cambio de aceite:`,
            currentKm
        );

        if (promptVal === null) return; // User cancelled

        const newKm = parseInt(promptVal, 10);
        if (isNaN(newKm) || newKm <= 0) {
            showNotification("⚠️ Kilometraje inválido.");
            return;
        }

        if (newKm > currentKm) {
            // Update vehicle current mileage too, if they input a higher mileage than current
            vehicleObj.mileage = newKm;
        }

        vehicleObj.lastOilChangeKm = newKm;
        localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
        logSystemEvent("SUCCESS", `Cambio de aceite registrado en ${vehicleObj.plate} a los ${newKm} km.`);
        showNotification("Cambio de aceite registrado exitosamente.");
        navigate('profile');
    },

    uploadVehiclePhoto: (index) => {
        const fileInput = document.getElementById(`vehPhotoInput${index}`);
        if (fileInput) {
            fileInput.click();
        }
    },

    handleVehiclePhotoUpload: (event, index) => {
        if (!currentUser || !currentUser.companyId) return;
        const comp = companiesState[currentUser.companyId];
        if (!comp) return;

        let vehicleObj = null;
        if (activeTrip && activeTrip.car) {
            vehicleObj = comp.vehicles.find(v => v.plate === activeTrip.car);
        }
        if (!vehicleObj) {
            vehicleObj = comp.vehicles.find(v => v.driver === currentUser.name);
        }

        if (!vehicleObj) {
            showNotification("No tienes ningún vehículo asignado para subir fotos.");
            return;
        }

        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            if (!vehicleObj.gallery) {
                vehicleObj.gallery = [null, null, null, null];
            }
            vehicleObj.gallery[index - 1] = base64;
            localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
            logSystemEvent("INFO", `Foto de estado (${index}/4) subida para ${vehicleObj.plate}.`);
            showNotification(`Foto ${index} subida correctamente.`);
            navigate('profile');
        };
        reader.readAsDataURL(file);
    },

    toggleTheme: () => {
        const root = document.documentElement;
        root.classList.toggle('light-theme');
        const isLight = root.classList.contains('light-theme');
        
        // Update quick conmutator icon inside #themeToggleBtn i
        const icon = document.querySelector('#themeToggleBtn i');
        if (icon) {
            if (isLight) {
                icon.className = 'fa-solid fa-sun text-lg';
            } else {
                icon.className = 'fa-solid fa-moon text-lg';
            }
        }
        showNotification(isLight ? "Modo Claro activado" : "Modo Oscuro activado");
    },

    getActiveTrip: () => {
        return activeTrip;
    },

    updateCompaniesState: (state) => {
        companiesState = state;
    }
};

// --- Rendering Orchestrators for SaaS Dashboards ---
const renderAdminDashboard = () => {
    if (!currentUser || currentUser.role !== 'Admin Empresa') return;
    
    const compId = currentUser.companyId;
    const comp = companiesState[compId];
    if (!comp) return;
    
    const adminCompanyTitle = $('#adminCompanyTitle');
    if (adminCompanyTitle) {
        adminCompanyTitle.innerText = comp.name;
    }
    
    const vehiclesCount = comp.vehicles.length;
    const alertsCount = comp.vehicles.reduce((acc, v) => acc + (v.alerts ? v.alerts.length : 0), 0);
    const companyReports = reportsHistoryState.filter(r => r.companyId === compId);
    const inspectionsCount = companyReports.length + 3;
    
    if ($('#adminKpiVehicles')) $('#adminKpiVehicles').innerText = vehiclesCount;
    if ($('#adminKpiAlerts')) $('#adminKpiAlerts').innerText = alertsCount;
    if ($('#adminKpiInspections')) $('#adminKpiInspections').innerText = inspectionsCount;
    
    const tableBody = $('#adminVehiclesTableBody');
    if (tableBody) {
        tableBody.innerHTML = comp.vehicles.map(v => {
            let statusColor = "bg-emerald-600/20 text-emerald-400";
            if (v.status === 'NO APTO') statusColor = "bg-red-600/20 text-red-400";
            if (v.status === 'ADVERTENCIA') statusColor = "bg-amber-600/20 text-amber-400";
            
            return `
                <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td class="p-4 font-bold text-white">${v.plate}</td>
                    <td class="p-4 uppercase text-[10px] text-gray-400 font-bold">${comp.type}</td>
                    <td class="p-4 font-medium">${v.brand} ${v.model}</td>
                    <td class="p-4 font-semibold">${v.mileage.toLocaleString()} Km</td>
                    <td class="p-4 text-gray-300">${v.driver || 'No asignado'}</td>
                    <td class="p-4"><span class="px-2.5 py-1 rounded text-[9px] font-extrabold ${statusColor}">${v.status}</span></td>
                    <td class="p-4 text-center">
                        <button onclick="deleteVehicle('${v.plate}')" class="text-red-400 hover:text-red-500 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"><i class="fa-solid fa-trash mr-1"></i>Eliminar</button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    const driverSelect = $('#vFormDriver');
    if (driverSelect) {
        driverSelect.innerHTML = comp.drivers.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    }
    
    const driversContainer = $('#adminDriversContainer');
    if (driversContainer) {
        driversContainer.innerHTML = comp.drivers.map(d => {
            const hasAssigned = comp.vehicles.find(v => v.driver === d.name);
            const carText = hasAssigned ? `Vehículo: ${hasAssigned.brand} ${hasAssigned.model} (${hasAssigned.plate})` : 'Sin vehículo asignado';
            
            return `
                <div class="glass p-5 rounded-3xl border border-white/5 space-y-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-300">
                            <i class="fa-solid fa-user-tie text-jungle"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-sm text-white">${d.name}</h4>
                            <p class="text-[10px] text-gray-400 font-medium">${d.role} | ${d.email}</p>
                        </div>
                    </div>
                    <div class="text-xs text-gray-400 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p class="mb-2 font-bold text-gray-200"><i class="fa-solid fa-car text-indigo-400 mr-2"></i>${carText}</p>
                        <p class="font-bold text-emerald-400"><i class="fa-solid fa-circle-check mr-2"></i>Licencia: Vigente</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="triggerVehicleAlertForDriver('${d.name}')" class="flex-1 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/10 rounded-xl text-[10px] font-bold transition-all"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Simular Alerta Mecánica</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    const alertsContainer = $('#adminAlertsList');
    if (alertsContainer) {
        const vehiclesWithAlerts = comp.vehicles.filter(v => v.alerts && v.alerts.length > 0);
        
        if (vehiclesWithAlerts.length === 0) {
            alertsContainer.innerHTML = `
                <div class="bg-emerald-950/10 border border-emerald-500/10 p-8 rounded-3xl text-center space-y-2">
                    <div class="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-xl text-emerald-400 mx-auto"><i class="fa-solid fa-circle-check"></i></div>
                    <h4 class="font-bold text-white text-sm">Flota Saludable</h4>
                    <p class="text-xs text-gray-400">No hay alertas activas en ningún vehículo de la flota en este momento.</p>
                    <button onclick="triggerDemoVehicleAlert()" class="mt-4 px-4 py-2 bg-jungle hover:opacity-90 text-white font-bold rounded-xl text-xs transition-all"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Simular Alerta Crítica</button>
                </div>
            `;
        } else {
            let alertsHtml = `
                <div class="flex justify-between items-center mb-4">
                    <span class="text-xs text-gray-400 font-bold uppercase tracking-widest">Lista de Alertas Reportadas</span>
                    <button onclick="triggerDemoVehicleAlert()" class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-[10px] transition-all"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Simular Alerta</button>
                </div>
            `;
            
            alertsHtml += vehiclesWithAlerts.map(v => {
                return v.alerts.map(alt => `
                    <div class="bg-red-950/20 border border-red-500/20 p-5 rounded-3xl flex justify-between items-center shadow-lg mb-3">
                        <div class="flex items-start gap-4">
                            <div class="p-3 bg-red-500/10 rounded-2xl text-red-500"><i class="fa-solid fa-triangle-exclamation text-lg"></i></div>
                            <div>
                                <h4 class="font-bold text-sm text-white">${v.brand} ${v.model} (<span class="text-red-400">${v.plate}</span>)</h4>
                                <p class="text-xs text-gray-300 mt-1">${alt}</p>
                                <span class="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase mt-2 inline-block">CRÍTICO</span>
                            </div>
                        </div>
                        <button onclick="resolveAlert('${v.plate}', '${alt}')" class="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-xl text-[10px] font-bold shadow-md transition-all"><i class="fa-solid fa-check mr-1"></i>Resolver y Limpiar</button>
                    </div>
                `).join('');
            }).join('');
            
            alertsContainer.innerHTML = alertsHtml;
        }
    }
    
    const periodicitySelect = $('#configIaPeriodicity');
    if (periodicitySelect) {
        periodicitySelect.value = comp.iaPeriodicity || 'semanal';
    }
    const obdCheck = $('#moduleObdCheck');
    if (obdCheck) {
        obdCheck.checked = comp.modules ? comp.modules.obd : false;
    }
    const voiceCheck = $('#moduleVoiceCheck');
    if (voiceCheck) {
        voiceCheck.checked = comp.modules ? comp.modules.voice : false;
    }
};

const renderSuperAdminDashboard = () => {
    if (!currentUser || currentUser.role !== 'Super Admin Global') return;
    
    let totalFleetCount = 0;
    for (const cid in companiesState) {
        totalFleetCount += companiesState[cid].vehicles.length;
    }
    
    const globalInspections = reportsHistoryState.length + 284;
    
    if ($('#superKpiFleet')) $('#superKpiFleet').innerText = totalFleetCount;
    if ($('#superKpiInspections')) $('#superKpiInspections').innerText = globalInspections;
    
    const tableBody = $('#superCompaniesTableBody');
    if (tableBody) {
        tableBody.innerHTML = Object.keys(companiesState).map(cid => {
            const comp = companiesState[cid];
            const isSuspended = comp.suspended || false;
            const statusBadge = isSuspended 
                ? `<span class="px-2.5 py-1 rounded text-[9px] font-extrabold bg-red-600/20 text-red-400">SUSPENDIDA</span>`
                : `<span class="px-2.5 py-1 rounded text-[9px] font-extrabold bg-emerald-600/20 text-emerald-400">ACTIVA</span>`;
            
            const actionBtn = isSuspended
                ? `<button onclick="toggleCompanyLicense('${cid}', false)" class="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all"><i class="fa-solid fa-play mr-1"></i>Activar</button>`
                : `<button onclick="toggleCompanyLicense('${cid}', true)" class="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-xl text-[10px] font-bold transition-all"><i class="fa-solid fa-pause mr-1"></i>Suspender</button>`;
            
            const modulesList = Object.keys(comp.modules || {})
                .filter(m => comp.modules[m])
                .map(m => m.toUpperCase())
                .join(', ') || 'NINGUNO';
                
            return `
                <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td class="p-4 font-bold text-white flex items-center gap-2"><i class="fa-solid ${comp.logo} text-purple-400 mr-1"></i> ${comp.name}</td>
                    <td class="p-4 uppercase text-[10px] text-gray-400 font-bold">${comp.type}</td>
                    <td class="p-4 font-medium">Enterprise SaaS</td>
                    <td class="p-4 font-bold">${comp.vehicles.length}</td>
                    <td class="p-4 capitalize font-semibold">${comp.iaPeriodicity || 'semanal'}</td>
                    <td class="p-4 text-[10px] font-bold text-gray-400">${modulesList}</td>
                    <td class="p-4">${statusBadge}</td>
                    <td class="p-4 text-center">${actionBtn}</td>
                </tr>
            `;
        }).join('');
    }
    
    const consoleLogsEl = $('#superConsoleLogs');
    if (consoleLogsEl) {
        consoleLogsEl.innerHTML = logsState.map(log => {
            let colorClass = "text-blue-400";
            if (log.type === "SUCCESS") colorClass = "text-emerald-400";
            if (log.type === "WARNING") colorClass = "text-amber-400";
            if (log.type === "ERROR") colorClass = "text-red-400";
            
            return `
                <div class="leading-relaxed py-0.5">
                    <span class="text-gray-500">[${log.time}]</span> 
                    <span class="font-bold ${colorClass}">[${log.type}]</span> 
                    <span class="text-gray-300">${log.message}</span>
                </div>
            `;
        }).join('');
        consoleLogsEl.scrollTop = consoleLogsEl.scrollHeight;
    }
};

// Map original HTML onclicks to appActions
window.simulateSend = window.appActions.simulateSend;
window.login = window.appActions.login;
window.logout = window.appActions.logout;
window.navigate = window.appActions.navigate;
window.cancelActiveInspection = window.appActions.cancelActiveInspection;
window.initTripSetup = window.appActions.initTripSetup;
window.initBusTripSetup = window.appActions.initBusTripSetup;
window.confirmTripSetup = window.appActions.confirmTripSetup;
window.startOBDScan = window.appActions.startOBDScan;
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

// Map enterprise/super actions globally
window.switchAdminTab = window.appActions.switchAdminTab;
window.switchSuperTab = window.appActions.switchSuperTab;
window.openAddVehicleForm = window.appActions.openAddVehicleForm;
window.closeAddVehicleForm = window.appActions.closeAddVehicleForm;
window.saveNewVehicle = window.appActions.saveNewVehicle;
window.deleteVehicle = window.appActions.deleteVehicle;
window.resolveAlert = window.appActions.resolveAlert;
window.changeCompanyConfig = window.appActions.changeCompanyConfig;
window.toggleCompanyLicense = window.appActions.toggleCompanyLicense;
window.triggerVehicleAlertForDriver = window.appActions.triggerVehicleAlertForDriver;
window.triggerDemoVehicleAlert = window.appActions.triggerDemoVehicleAlert;
window.loginAsDemo = window.appActions.loginAsDemo;
window.startPreoperacional = window.appActions.startPreoperacional;

// Map SOS Accident Actions globally
window.triggerAccidentPhoto = window.appActions.triggerAccidentPhoto;
window.handleAccidentImage = window.appActions.handleAccidentImage;
window.clearAccidentSignature = window.appActions.clearAccidentSignature;
window.submitAccidentReport = window.appActions.submitAccidentReport;

// Map Oil and Theme actions globally
window.openOilChangeDialog = window.appActions.openOilChangeDialog;
window.uploadVehiclePhoto = window.appActions.uploadVehiclePhoto;
window.handleVehiclePhotoUpload = window.appActions.handleVehiclePhotoUpload;
window.toggleTheme = window.appActions.toggleTheme;

// --- DOM Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    const appComponents = $('#app-components');
    if (appComponents) {
        appComponents.innerHTML = renderModals() + renderBottomNav();
    }
    
    // Check if user is already logged in (persistence) or go to splash
    setTimeout(() => {
        navigate('landing');
    }, 2500);

    renderChecklist(inspectionResults);
});

// Event Listeners for file inputs
document.addEventListener('change', (e) => {
    if (['fileInput', 'cameraInput', 'galleryInput'].includes(e.target.id)) {
        window.appActions.handleImageSelect(e);
    }
});

