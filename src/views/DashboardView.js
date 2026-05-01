import { $ } from '../utils/dom.js';

export function updateDashboard(currentUser, activeTrip, reportsHistory) {
    $('#dashName').innerText = currentUser ? `Hola, ${currentUser.name.split(' ')[0]}` : 'Bienvenido';
    $('#dashRole').innerText = currentUser ? currentUser.role : 'Modo Invitado';
    
    const lastReportBox = $('#dashLastReport');
    if (reportsHistory.length > 0) {
        const r = reportsHistory[0];
        const color = r.status === 'APTO' ? 'green' : (r.status === 'ADVERTENCIA' ? 'yellow' : 'red');
        lastReportBox.innerHTML = `
            <div class="flex items-center justify-between bg-${color}-50 p-4 rounded-2xl border border-${color}-100">
               <div>
                  <p class="text-xs font-bold text-${color}-700">${r.id}</p>
                  <p class="text-[10px] text-${color}-600"><i class="fa-solid fa-clock mr-1"></i>${r.date}</p>
               </div>
               <div class="text-right">
                  <p class="text-xs font-black text-${color}-800">${r.score}% Score</p>
                  <p class="text-[10px] font-bold text-${color}-700 bg-white px-2 py-1 rounded mt-1 inline-block">${r.status}</p>
               </div>
            </div>`;
    } else {
        lastReportBox.innerHTML = `
            <div class="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 text-center">
               <p class="text-xs text-gray-400">Sin historial disponible</p>
            </div>`;
    }

    if (activeTrip) {
        $('#dashActiveTrip').classList.remove('hidden');
        $('#btnStartNewTrip').classList.add('hidden');
        $('#btnStartBusTrip').classList.add('hidden');
        $('#activeCarName').innerText = activeTrip.car;
        $('#activeEndTime').innerText = activeTrip.time;
        $('#activeDriverName').innerText = activeTrip.driver;
    } else {
        $('#dashActiveTrip').classList.add('hidden');
        $('#btnStartNewTrip').classList.remove('hidden');
        $('#btnStartBusTrip').classList.remove('hidden');
    }
}
