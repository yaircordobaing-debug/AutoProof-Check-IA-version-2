import { $, showNotification } from '../utils/dom.js';

export async function handleLogin(isUser, navigate) {
    let currentUser = null;
    
    if (isUser) {
        const emailInput = $('#loginEmail').value;
        const passwordInput = $('#loginPassword').value;

        if (!emailInput || !passwordInput) {
            showNotification("Por favor ingresa correo y contraseña");
            return null;
        }

        try {
            const res = await fetch('/mock_database.json');
            const data = await res.json();
            
            const user = data.users.find(u => u.email === emailInput);
            
            if (!user) {
                showNotification("Usuario no encontrado");
                return null;
            }
            
            if (!user.active) {
                showNotification(`Usuario inactivo. Licencia: ${user.license_status}`);
                return null;
            }

            // Simplificación para la demo (cualquier password no vacío pasa si existe el user)
            currentUser = { 
                id: user.id,
                name: user.full_name, 
                email: user.email, 
                role: user.role === 'driver' ? 'Conductor Autorizado' : 'Admin',
                license: user.driver_license,
                driver_id: user.driver_id,
                phone: user.phone
            };
            
            // Buscar vehículo asignado
            const assignment = data.driver_vehicle_assignments.find(a => a.user_id === user.id);
            if (assignment) {
                const vehicle = data.vehicles.find(v => v.id === assignment.vehicle_id);
                if (vehicle) currentUser.assignedVehicle = vehicle;
            }

            showNotification(`Bienvenido, ${user.full_name}`);
        } catch (error) {
            console.error("Error al cargar mock database:", error);
            showNotification("Error de conexión con la base de datos");
            return null;
        }
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
