// Base items and dynamic categories generator for Opercheck IA
import { dailyCarItems } from './inspectionCar.js';
import { dailyBusItems } from './inspectionBus.js';
import { dailyTruckItems } from './inspectionTruck.js';
import { weeklyIAItems } from './inspectionIA.js';

export let inspectionData = [];

export function setupInspectionItems(vehicleType, isWeeklyIA) {
    // Clear array
    inspectionData.length = 0;

    if (isWeeklyIA) {
        // Deep Weekly IA Inspection
        inspectionData.push({
            category: "1. Verificaciones con IA Multimodal",
            icon: "fa-wand-magic-sparkles",
            items: weeklyIAItems
        });
        
        // Add a secondary category for manual confirmations during deep check
        inspectionData.push({
            category: "2. Chequeo Técnico Complementario",
            icon: "fa-clipboard-check",
            items: [
                { id: "mn_frenos", name: "Frenos de Servicio", desc: "Presión y respuesta al tacto.", type: "USR" },
                { id: "mn_direccion", name: "Sistema de Dirección", desc: "¿Giro suave y sin holguras?", type: "USR" }
            ]
        });
    } else {
        // Daily Quick checklist based on type
        let items = dailyCarItems;
        let categoryName = "Inspección Pre-Viaje (Carro)";
        let icon = "fa-car";

        if (vehicleType === "buses") {
            items = dailyBusItems;
            categoryName = "Inspección Pre-Viaje (Bus)";
            icon = "fa-bus";
        } else if (vehicleType === "camiones") {
            items = dailyTruckItems;
            categoryName = "Inspección Pre-Viaje (Camión)";
            icon = "fa-truck";
        }

        inspectionData.push({
            category: categoryName,
            icon: icon,
            items: items
        });
    }
}

// Initialize with Car items by default for backwards compatibility
setupInspectionItems("carros", false);
