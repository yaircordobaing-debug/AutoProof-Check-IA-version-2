export function renderInspectionItem(item, status, onAction) {
    const isCompleted = status && status.completed;
    const isFail = status && status.status === 'No Cumple';
    const isWarn = status && status.status === 'Advertencia';
    
    let statusClass = 'bg-gray-50 text-gray-400';
    let statusIcon = 'fa-circle-question';
    let statusText = 'Pendiente';

    if (isCompleted) {
        if (isFail) {
            statusClass = 'bg-red-50 text-red-600';
            statusIcon = 'fa-circle-xmark';
            statusText = 'No Cumple';
        } else if (isWarn) {
            statusClass = 'bg-amber-50 text-amber-600';
            statusIcon = 'fa-circle-exclamation';
            statusText = 'Advertencia';
        } else {
            statusClass = 'bg-green-50 text-green-600';
            statusIcon = 'fa-circle-check';
            statusText = 'Cumple';
        }
    }

    const typeLabels = {
        'IA-V': { label: 'IA Visión', color: 'jungle', icon: 'fa-eye' },
        'IA-A': { label: 'IA Acústica', color: 'blue-500', icon: 'fa-microphone-lines' },
        'VAL': { label: 'Medición', color: 'purple-500', icon: 'fa-gauge' },
        'USR': { label: 'Manual', color: 'gray-500', icon: 'fa-hand-pointer' }
    };
    
    const type = typeLabels[item.type.split('-')[0]] || typeLabels['USR'];

    return `
        <div class="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100 premium-card flex justify-between items-center transition-all ${isCompleted ? 'opacity-90' : ''}" 
             onclick="window.appActions.openCheckModal('${item.id}')">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-gray-50 text-gray-300 ${isCompleted ? 'bg-' + type.color + '/10 text-' + type.color : ''}">
                    <i class="fa-solid ${type.icon}"></i>
                </div>
                <div>
                    <h4 class="font-bold text-gray-800 text-sm">${item.name}</h4>
                    <p class="text-[10px] text-gray-400 font-medium">${item.desc || 'Revisión técnica'}</p>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">${type.label}</span>
                        ${status && status.method === 'LEG' ? '<span class="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">Protocolo LEG</span>' : ''}
                    </div>
                </div>
            </div>
            <div class="flex flex-col items-end gap-1">
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl ${statusClass} transition-colors">
                    <i class="fa-solid ${statusIcon} text-xs"></i>
                    <span class="text-[10px] font-bold uppercase tracking-tight">${statusText}</span>
                </div>
                ${isCompleted && status.detected_values ? `<span class="text-[9px] font-bold text-gray-400">${status.detected_values}</span>` : ''}
            </div>
        </div>
    `;
}
