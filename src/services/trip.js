import { $, showNotification } from '../utils/dom.js';

export function initTripSetup(currentUser, companyFleet, navigate) {
    const driverInput = $('#tripDriver');
    const carSelect = $('#tripCar');

    if (currentUser) {
        driverInput.value = currentUser.name;
        carSelect.innerHTML = companyFleet.map(car => `<option value="${car}">${car}</option>`).join('');
    } else {
        driverInput.value = 'Usuario Invitado';
        carSelect.innerHTML = `<option value="Vehículo Personal">Mi Vehículo Personal</option>`;
    }

    $('#tripTime').value = '';
    
    // Auto-update starting mileage based on selected vehicle
    const updateMileage = () => {
        const selectedValue = carSelect.value;
        const startKmInput = $('#tripStartKm');
        if (startKmInput) {
            let mileage = 12500; // default mock
            if (currentUser && currentUser.companyId) {
                const companiesState = JSON.parse(localStorage.getItem('saas_companies_state'));
                const comp = companiesState[currentUser.companyId];
                if (comp) {
                    const matchedVeh = comp.vehicles.find(v => selectedValue.includes(v.plate));
                    if (matchedVeh) {
                        mileage = matchedVeh.mileage;
                    }
                }
            }
            startKmInput.value = mileage;
        }
    };
    
    carSelect.onchange = updateMileage;
    updateMileage(); // Run on init
    
    navigate('trip-setup');
}

export function initBusTripSetup(currentUser, companyFleet, navigate) {
    initTripSetup(currentUser, companyFleet, navigate);
}

export function confirmTripSetup(navigate) {
    const time = $('#tripTime').value;
    if (!time) {
        showNotification("Es obligatorio ingresar la hora estimada de entrega.");
        return null;
    }

    const startKmVal = $('#tripStartKm') ? parseInt($('#tripStartKm').value) : 0;
    if (isNaN(startKmVal) || startKmVal <= 0) {
        showNotification("Es obligatorio ingresar un kilometraje inicial válido.");
        return null;
    }

    const pendingTrip = {
        car: $('#tripCar').value,
        driver: $('#tripDriver').value,
        time: time,
        startKm: startKmVal
    };

    return pendingTrip;
}

export function submitTripReview(currentRating, navigate) {
    if (currentRating === 0) {
        showNotification("Por favor califica el vehículo para continuar.");
        return false;
    }

    const endKmInput = $('#tripEndKm');
    const endKmVal = endKmInput ? parseInt(endKmInput.value) : 0;
    
    // Fetch startKm from activeTrip state
    const activeTrip = window.appActions.getActiveTrip ? window.appActions.getActiveTrip() : null;
    if (activeTrip && activeTrip.startKm) {
        if (isNaN(endKmVal) || endKmVal < activeTrip.startKm) {
            showNotification(`El kilometraje final debe ser mayor o igual al inicial (${activeTrip.startKm} km).`);
            return false;
        }
    }

    const reviewText = $('#tripReviewText').value;
    console.log("Reseña enviada:", currentRating, "Estrellas. Texto:", reviewText, "Km Final:", endKmVal);

    // Save final odometer reading in persistent database
    if (activeTrip && activeTrip.car && endKmVal > 0) {
        const companiesState = JSON.parse(localStorage.getItem('saas_companies_state'));
        let updated = false;
        for (const cid in companiesState) {
            const comp = companiesState[cid];
            const matchedVeh = comp.vehicles.find(v => activeTrip.car.includes(v.plate));
            if (matchedVeh) {
                matchedVeh.mileage = endKmVal;
                updated = true;
                break;
            }
        }
        if (updated) {
            localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
            // Trigger refresh in window level
            if (window.appActions.updateCompaniesState) {
                window.appActions.updateCompaniesState(companiesState);
            }
        }
    }

    $('#tripReviewText').value = '';
    if (endKmInput) endKmInput.value = '';
    showNotification("Reseña enviada exitosamente. Vehículo liberado.");
    navigate('dashboard');
    return true;
}
