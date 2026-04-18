import { $ } from '../utils/dom.js';

const obdSteps = [
    { label: 'Sistema de Inyección', icon: 'fa-gas-pump' },
    { label: 'Sensores de Emisión (O2)', icon: 'fa-wind' },
    { label: 'Temperatura del Motor', icon: 'fa-temperature-half' },
    { label: 'Voltaje de Batería', icon: 'fa-car-battery' }
];

export function startOBDScan(onComplete) {
    $('#obd-connect').classList.add('hidden');
    const scanningBox = $('#obd-scanning');
    scanningBox.classList.remove('hidden');
    scanningBox.classList.add('flex');
    
    const checksContainer = $('#obd-checks');
    checksContainer.innerHTML = obdSteps.map((s, i) => `
        <div id="obd-chk-${i}" class="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-colors">
            <div class="flex items-center gap-3">
                <i class="fa-solid ${s.icon} text-gray-400 w-5 text-center"></i>
                <span class="text-sm font-medium text-gray-700">${s.label}</span>
            </div>
            <i id="obd-icon-${i}" class="fa-solid fa-circle-notch fa-spin text-blue-400 text-lg"></i>
        </div>
    `).join('');

    let progress = 0;
    const bar = $('#obd-progress');
    
    const interval = setInterval(() => {
        progress += 2;
        bar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                scanningBox.classList.add('hidden');
                scanningBox.classList.remove('flex');
                const done = $('#obd-done');
                done.classList.remove('hidden');
                done.classList.add('flex');
                if (onComplete) onComplete();
            }, 500);
        }
    }, 30);

    setTimeout(() => markObdCheck(0), 600);
    setTimeout(() => markObdCheck(1), 1200);
    setTimeout(() => markObdCheck(2), 1800);
    setTimeout(() => markObdCheck(3), 2200);
}

function markObdCheck(index) {
    const container = $(`#obd-chk-${index}`);
    const icon = $(`#obd-icon-${index}`);
    if(container && icon) {
        container.classList.add('bg-green-50', 'border-green-100');
        container.classList.remove('bg-gray-50');
        icon.className = "fa-solid fa-circle-check text-green-500 text-lg slide-up";
    }
}
