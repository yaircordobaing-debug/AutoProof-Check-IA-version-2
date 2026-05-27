import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_submit = '''submitFinalReport: async () => {
        const email = $('#driverEmail').value;
        const canvas = document.getElementById('signature-pad');
        if (canvas) {
            currentFinalReport.signature = canvas.toDataURL();
        }

        if (!email || !email.includes('@')) {
            showNotification("Por favor ingresa un correo válido");
            return;
        }

        if (currentUser && currentUser.companyId) {
            currentFinalReport.companyId = currentUser.companyId;
        }

        const res = await submitFinalReport(currentFinalReport, email, reportsHistory);
        if (res) {
            $('#finalModal').classList.add('hidden');
            
            // Update local company vehicle status
            if (currentUser && currentUser.companyId) {
                const comp = companiesState[currentUser.companyId];
                if (comp) {
                    const plate = currentFinalReport.vehicle_plate;
                    const vehicle = comp.vehicles.find(v => v.plate === plate);
                    if (vehicle) {
                        vehicle.status = currentFinalReport.status; // APTO, ADVERTENCIA, NO APTO
                        if (currentFinalReport.status !== 'APTO') {
                            const isAI = window.isWeeklyGlobal;
                            const typeMsg = isAI ? "riesgo_ia" : "inspeccion_fallida";
                            comp.alertsHistory.unshift({
                                id: Date.now().toString(),
                                type: typeMsg,
                                message: `Vehículo ${plate} marcado como ${currentFinalReport.status} en ${isAI ? 'Preoperacional IA' : 'Preoperacional Diario'}`,
                                date: new Date().toLocaleDateString(),
                                severity: currentFinalReport.status === 'NO APTO' ? 'high' : 'medium'
                            });
                        }
                    }
                    localStorage.setItem('saas_companies_state', JSON.stringify(companiesState));
                }
            }

            pendingTrip = null;
            inspectionResults = {};
            renderChecklist(inspectionResults);
            localStorage.setItem('saas_reports_history', JSON.stringify(reportsHistory));
            
            // Log global
            logSystemEvent("SUCCESS", `Reporte ${res.report_id || 'Generado'} para ${currentFinalReport.vehicle_plate} por ${currentUser ? currentUser.name : 'Invitado'}. Estado: ${currentFinalReport.status}`);
            
            showPdfResultModal(true, "REPORTE GENERADO", `El PDF ha sido generado y firmado con blockchain. Copia enviada a ${email}.`, () => {
                navigate('dashboard');
            });
        } else {
            showNotification("Error de red. Intenta de nuevo.");
        }
    },'''

start_idx = content.find('submitFinalReport: async () => {')
if start_idx != -1:
    end_idx = content.find('switchAdminTab: (tab) => {', start_idx)
    content = content[:start_idx] + new_submit + '\n    ' + content[end_idx:]
    with open('src/main.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched submitFinalReport")
else:
    print("Could not find start_idx")
