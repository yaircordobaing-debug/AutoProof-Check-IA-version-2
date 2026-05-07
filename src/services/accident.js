import { $, showNotification } from '../utils/dom.js';

const accidentSteps = [
    { title: "1. Foto Panorámica", desc: "Toma una foto general del lugar del accidente." },
    { title: "2. Vehículos", desc: "Toma fotos de todos los ángulos y placas de los vehículos." },
    { title: "3. Daños", desc: "Toma fotos en primer plano de los daños." },
    { title: "4. Señales de Tránsito", desc: "Captura las señales verticales y horizontales cercanas." },
    { title: "5. Marcas en la Vía", desc: "Fotografía huellas de frenado o fluidos." },
    { title: "6. Puntos de Referencia", desc: "Incluye elementos fijos como postes o edificios." },
    { title: "7. Foto a Distancia", desc: "Toma una foto desde lejos para ver la perspectiva general." }
];

let currentAccidentStep = 0;
let accidentPhotos = [];
let witnesses = [];
let currentGPS = { lat: null, lng: null };

export function initAccidentReport(navigate, currentUser, activeTrip) {
    currentAccidentStep = 0;
    accidentPhotos = [];
    witnesses = [];
    currentGPS = { lat: null, lng: null };

    // Request Geolocation
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                currentGPS.lat = pos.coords.latitude;
                currentGPS.lng = pos.coords.longitude;
                showNotification("Ubicación GPS capturada con éxito.");
            },
            (err) => {
                console.warn("GPS Denied or Error", err);
                showNotification("No se pudo obtener GPS. Usa ubicación manual.");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    updateAccidentPhotoUI();
    
    // Clear Form Fields initially
    ['accLocation', 'accSeverity', 'accDriverName', 'accDriverId', 'accDriverPhone', 'accDriverLicense', 
     'accVehiclePlate', 'accVehicleSOAT', 'accVehicleInsurance'].forEach(id => {
         const el = $(`#${id}`);
         if (el) el.value = '';
    });
    
    // Auto-fill Driver Data
    if (currentUser) {
        if ($('#accDriverName')) $('#accDriverName').value = currentUser.name || '';
        if ($('#accDriverId')) $('#accDriverId').value = currentUser.driver_id || '';
        if ($('#accDriverPhone')) $('#accDriverPhone').value = currentUser.phone || '';
        if ($('#accDriverLicense')) $('#accDriverLicense').value = currentUser.license || '';
    }
    
    // Auto-fill Vehicle Data
    // Priority: 1. activeTrip.vehicle, 2. currentUser.assignedVehicle
    const vehicle = (activeTrip && activeTrip.vehicle) ? activeTrip.vehicle : (currentUser && currentUser.assignedVehicle ? currentUser.assignedVehicle : null);
    
    if (vehicle) {
        // En activeTrip guardábamos car (string), pero asumiendo vehicle object o assignedVehicle
        // Como activeTrip.car es string, preferimos assignedVehicle si es el mismo
        const plate = vehicle.plate || (activeTrip ? activeTrip.car : '');
        if ($('#accVehiclePlate')) $('#accVehiclePlate').value = plate;
    }
    
    const severitySelect = $('#accSeverity');
    if (severitySelect) severitySelect.value = 'Leve';
    
    ['accDocSOAT', 'accDocLic', 'accDocProp'].forEach(id => {
        const el = $(`#${id}`);
        if (el) {
            el.src = '';
            el.classList.add('hidden');
        }
    });

    $('#accWitnessesList').innerHTML = '';
    
    navigate('accident-photos');
}

export function handleAccidentPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            accidentPhotos[currentAccidentStep] = e.target.result;
            $('#accPhotoPreview').src = e.target.result;
            $('#accPhotoPreview').classList.remove('hidden');
            $('#accPhotoPlaceholder').classList.add('hidden');
            $('#btnNextAccPhoto').disabled = false;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

export function nextAccidentPhoto(navigate) {
    if (!accidentPhotos[currentAccidentStep]) {
        showNotification("Debes tomar la foto para continuar.");
        return;
    }

    currentAccidentStep++;
    
    if (currentAccidentStep < accidentSteps.length) {
        updateAccidentPhotoUI();
    } else {
        // Go to form
        navigate('accident-form');
    }
}

function updateAccidentPhotoUI() {
    const step = accidentSteps[currentAccidentStep];
    $('#accPhotoTitle').innerText = step.title;
    $('#accPhotoDesc').innerText = step.desc;
    $('#accPhotoProgress').innerText = `${currentAccidentStep + 1}/${accidentSteps.length}`;
    
    $('#accPhotoInput').value = '';
    $('#btnNextAccPhoto').disabled = true;
    
    if (accidentPhotos[currentAccidentStep]) {
        $('#accPhotoPreview').src = accidentPhotos[currentAccidentStep];
        $('#accPhotoPreview').classList.remove('hidden');
        $('#accPhotoPlaceholder').classList.add('hidden');
        $('#btnNextAccPhoto').disabled = false;
    } else {
        $('#accPhotoPreview').src = '';
        $('#accPhotoPreview').classList.add('hidden');
        $('#accPhotoPlaceholder').classList.remove('hidden');
    }
    
    if (currentAccidentStep === accidentSteps.length - 1) {
        $('#btnNextAccPhoto').innerHTML = `Llenar Formulario <i class="fa-solid fa-arrow-right"></i>`;
    } else {
        $('#btnNextAccPhoto').innerHTML = `Siguiente Foto <i class="fa-solid fa-arrow-right"></i>`;
    }
}

export function previewDoc(input, imgId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = $(`#${imgId}`);
            img.src = e.target.result;
            img.classList.remove('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

export function addWitness() {
    const id = Date.now();
    witnesses.push(id);
    const html = `
        <div class="p-4 border border-gray-200 rounded-xl bg-gray-50 mb-2 relative" id="witness-${id}">
            <button onclick="removeWitness(${id})" class="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"><i class="fa-solid fa-trash"></i></button>
            <input type="text" placeholder="Nombre del testigo" class="w-full p-2 mb-2 bg-white border border-gray-200 rounded-lg text-sm">
            <input type="tel" placeholder="Teléfono" class="w-full p-2 mb-2 bg-white border border-gray-200 rounded-lg text-sm">
            <button class="w-full py-2 bg-blue-50 text-blue-600 font-bold rounded-lg text-sm flex items-center justify-center gap-2"><i class="fa-solid fa-microphone"></i> Grabar Versión (Audio)</button>
        </div>
    `;
    $('#accWitnessesList').insertAdjacentHTML('beforeend', html);
}

export function removeWitness(id) {
    const el = $(`#witness-${id}`);
    if (el) el.remove();
    witnesses = witnesses.filter(w => w !== id);
}

export async function submitAccidentReport(navigate) {
    // Basic validation
    if (!$('#accDriverName').value || !$('#accVehiclePlate').value) {
        showNotification("Completa al menos el nombre del conductor y la placa del vehículo.");
        return;
    }
    
    showNotification("Enviando reporte y generando PDF...", 5000);
    
    // Prepare the payload
    const payload = {
        location: $('#accLocation') ? $('#accLocation').value : "",
        severity: $('#accSeverity') ? $('#accSeverity').value : "Leve",
        latitude: currentGPS.lat,
        longitude: currentGPS.lng,
        driver_name: $('#accDriverName').value,
        driver_id: $('#accDriverId').value || "",
        driver_phone: $('#accDriverPhone').value || "",
        driver_license: $('#accDriverLicense').value || "",
        vehicle_plate: $('#accVehiclePlate').value,
        vehicle_soat: $('#accVehicleSOAT').value || "",
        vehicle_insurance: $('#accVehicleInsurance').value || "",
        photos: accidentPhotos.filter(p => p !== undefined && p !== null),
        witnesses: [], // Empty for now, but could be parsed from UI
        doc_soat: $('#accDocSOAT') && !$('#accDocSOAT').classList.contains('hidden') ? $('#accDocSOAT').src : "",
        doc_lic: $('#accDocLic') && !$('#accDocLic').classList.contains('hidden') ? $('#accDocLic').src : "",
        doc_prop: $('#accDocProp') && !$('#accDocProp').classList.contains('hidden') ? $('#accDocProp').src : ""
    };

    try {
        const response = await fetch('http://localhost:8000/v1/generate-accident-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Accident Report Generated:", data);
        
        showNotification("Reporte generado exitosamente. PDF guardado.");
        navigate('dashboard');
    } catch (error) {
        console.error("Error generating accident report:", error);
        showNotification("Error al enviar el reporte. Intenta de nuevo.");
    }
}

