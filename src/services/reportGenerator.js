import { $ } from '../utils/dom.js';
import { inspectionData } from '../data/inspectionItems.js';
import { generateReportAPI } from './api.js';

export function evaluarReporte(results, currentUser, activeTrip, pendingTrip) {
    let total = 0, completados = 0;
    let fallos = [];

    inspectionData.forEach(cat => {
        cat.items.forEach(i => {
            total++;
            if (results[i.id]) {
                completados++;
                if (results[i.id].status === 'No Cumple') fallos.push(i.name);
            }
        });
    });

    if (completados < total) {
        alert(`Debes completar la inspección. Te faltan ${total - completados} puntos.`);
        return null;
    }

    let score = 100 - (fallos.length * (100/total));
    score = Math.max(0, Math.round(score));
    let hasManual = Object.values(results).some(r => r.method === 'LEG');

    return {
        trip_id: `AP-2026-${Math.floor(Math.random() * 900 + 100)}`,
        driver_name: currentUser ? currentUser.name : "Invitado",
        vehicle_plate: activeTrip ? activeTrip.car : (pendingTrip ? pendingTrip.car : "ABC-123"),
        items: Object.keys(results).map(id => {
            let item;
            inspectionData.forEach(cat => cat.items.forEach(i => { if(i.id === id) item = i; }));
            return {
                id: id,
                name: item.name,
                status: results[id].status,
                method: results[id].method || item.type,
                observation: results[id].observation || "",
                detected_values: results[id].detected_values || "",
                image_data: results[id].image_data || ""
            };
        }),
        score: score,
        status: fallos.length === 0 ? (hasManual ? 'APTO CON OBSERVACIONES' : 'APTO') : (fallos.length <= 2 ? 'ADVERTENCIA' : 'NO APTO'),
        email: currentUser ? currentUser.email : ""
    };
}

export async function submitFinalReport(report, email, reportsHistory) {
    if (!email || !email.includes('@')) return null;

    const payload = { ...report, email: email };
    try {
        const data = await generateReportAPI(payload);
        if (data.url) {
            reportsHistory.unshift({
                id: data.report_id || payload.trip_id,
                date: new Date().toLocaleDateString(),
                score: payload.score,
                status: payload.status,
                url: data.url
            });
            return data;
        }
    } catch (error) {
        console.error("Report Error:", error);
    }
    return null;
}
