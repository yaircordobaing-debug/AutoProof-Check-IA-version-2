// URL del Backend en Render (Cámbiala cuando tengas la de Render)
export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || ""; 

export async function callGeminiAPI(base64Data, specificPrompt, currentItemId) {
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    
    const formData = new FormData();
    formData.append('item_id', currentItemId);
    formData.append('prompt', specificPrompt || "Analiza la imagen.");
    formData.append('image', blob, 'evidence.jpg');

    const response = await fetch(`${API_BASE_URL}/v1/analyze`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Error en el servidor');
    }

    return await response.json();
}

export async function generateReportAPI(reportData) {
    const response = await fetch(`${API_BASE_URL}/v1/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
    });
    
    if (!response.ok) throw new Error("Error generating report");
    const data = await response.json();
    
    // Convertir URL relativa a absoluta para que el frontend pueda abrir el PDF correctamente
    if (data.url && !data.url.startsWith('http')) {
        // Asegurarse de que API_BASE_URL no termine en slash y data.url empiece con slash
        const baseUrl = API_BASE_URL.replace(/\/$/, '');
        const pathUrl = data.url.startsWith('/') ? data.url : `/${data.url}`;
        data.url = `${baseUrl}${pathUrl}`;
    }
    
    return data;
}
