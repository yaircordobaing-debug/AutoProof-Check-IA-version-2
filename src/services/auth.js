import { showNotification } from '../utils/dom.js';

export function handleLogin(isUser, navigate) {
    let currentUser = null;
    if (isUser) {
        currentUser = { name: 'Juan Perez', email: 'juan.perez@transporte.co', role: 'Conductor Autorizado' };
        showNotification("Sesión corporativa iniciada");
    } else {
        currentUser = null;
        showNotification("Modo invitado activado");
    }
    navigate('dashboard');
    return currentUser;
}

export function handleLogout(navigate) {
    showNotification("Sesión cerrada");
    navigate('login');
    return null;
}
