import { renderInspectionItem } from '../components/InspectionItem.js';
import { inspectionData } from '../data/inspectionItems.js';
import { $ } from '../utils/dom.js';

export function renderChecklist(inspectionResults) {
    const container = $('#checklistContainer');
    if (!container) return;

    let html = '';
    inspectionData.forEach(cat => {
        html += `
            <div class="mb-8">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2 flex items-center gap-2">
                    <i class="fa-solid ${cat.icon} text-jungle"></i> ${cat.category}
                </h3>
        `;
        cat.items.forEach(item => {
            html += renderInspectionItem(item, inspectionResults[item.id]);
        });
        html += `</div>`;
    });
    container.innerHTML = html;
    updateProgressBar(inspectionResults);
}

export function updateProgressBar(inspectionResults) {
    const total = inspectionData.reduce((acc, cat) => acc + cat.items.length, 0);
    const completed = Object.values(inspectionResults).filter(r => r.completed).length;
    const percent = Math.round((completed / total) * 100);
    
    const bar = $('#progressBar');
    const text = $('#progressText');
    if (bar) bar.style.width = `${percent}%`;
    if (text) text.innerText = `${percent}%`;
}
