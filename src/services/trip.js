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
    
    navigate('trip-setup');
}

export function initBusTripSetup(currentUser, companyFleet, navigate) {
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
    
    navigate('trip-setup');
}

export function confirmTripSetup(navigate) {
    const time = $('#tripTime').value;
    if (!time) {
        showNotification("Es obligatorio ingresar la hora estimada de entrega.");
        return null;
    }

    const pendingTrip = {
        car: $('#tripCar').value,
        driver: $('#tripDriver').value,
        time: time
    };

    return pendingTrip;
}

export function submitTripReview(currentRating, navigate) {
    if (currentRating === 0) {
        showNotification("Por favor califica el vehículo para continuar.");
        return false;
    }

    const reviewText = $('#tripReviewText').value;
    console.log("Reseña enviada:", currentRating, "Estrellas. Texto:", reviewText);

    $('#tripReviewText').value = '';
    showNotification("Reseña enviada exitosamente. Vehículo liberado.");
    navigate('dashboard');
    return true;
}
