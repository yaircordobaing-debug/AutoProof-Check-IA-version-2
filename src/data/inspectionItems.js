export const inspectionData = [
    {
        category: "1. Exterior e IA (Cámara)",
        icon: "fa-robot",
        items: [
            { id: "ia_fugas", name: "Fugas en el suelo", desc: "Detección de líquidos bajo el motor.", type: "IA-V", prompt: "Analiza el suelo en busca de manchas de aceite o refrigerante." },
            { id: "ia_vidrio_panoramico", name: "Vidrio Panorámico", desc: "Fisuras o impactos frontales.", type: "IA-V", prompt: "Evalúa grietas o puntos de impacto en el vidrio delantero." },
            { id: "ia_vidrio_trasero", name: "Vidrio Trasero", desc: "Visibilidad e integridad posterior.", type: "IA-V", prompt: "Verifica el estado del vidrio de la parte de atrás." },
            { id: "ia_llantas_visual", name: "Estado Visual Llantas", desc: "Cortes, deformaciones o hernias (4 llantas).", type: "IA-V-SEQ", prompt: "Evalúa el estado físico exterior de cada neumático." },
            { id: "ia_luces_frente", name: "Luces Altas y Bajas", desc: "Intensidad y funcionamiento.", type: "IA-V", prompt: "Captura los faros delanteros encendidos." },
            { id: "ia_luces_direc", name: "Direccionales", desc: "Flasher y funcionamiento rítmico.", type: "IA-V", prompt: "Verifica el funcionamiento de las luces de cruce." },
            { id: "ia_luces_stop", name: "Luces de Stop", desc: "Intensidad al frenar.", type: "IA-V", prompt: "Captura las luces traseras al presionar el freno." },
            { id: "ia_documentos", name: "Documentos (OCR)", desc: "SOAT y Técnico-Mecánica.", type: "IA-V", prompt: "Analiza fechas de vigencia en los documentos." },
            { id: "mn_plumillas", name: "Limpia Parabrisas", desc: "Estado de las plumillas y barrido.", type: "IA-V", prompt: "Captura las plumillas del parabrisas para evaluar su estado físico." },
            { id: "mn_kit_carretera", name: "Kit de Carretera (COL)", desc: "Extintor, botiquín, señales.", type: "IA-V", prompt: "Captura el kit de carretera abierto para verificar sus elementos." },
            { id: "mn_cinturon_cond", name: "Cinturón Conductor", desc: "Anclaje y tensión.", type: "USR" },
            { id: "mn_cinturon_copiloto", name: "Cinturón Copiloto", desc: "Anclaje y tensión.", type: "USR" }
        ]
    },
    {
        category: "2. Mediciones Técnicas (Llantas)",
        icon: "fa-gauge-high",
        items: [
            { id: "hy_presion", name: "Presión de Llantas", desc: "Medición en PSI (4 llantas).", type: "VAL-SEQ", unit: "PSI", prompt: "Captura la presión de cada llanta." },
            { id: "hy_labrado", name: "Profundidad de Labrado", desc: "Mínimo legal 1.6mm (4 llantas).", type: "VAL-SEQ", unit: "mm", prompt: "Captura el labrado de cada llanta." },
            { id: "hy_aceite", name: "Nivel de Aceite", desc: "Medición por varilla.", type: "VAL", unit: "%", prompt: "Foto de la varilla de aceite." }
        ]
    },
    {
        category: "3. Diagnóstico Acústico (IA-A)",
        icon: "fa-microphone-lines",
        items: [
            { id: "au_claxon", name: "Claxon", desc: "Intensidad sonora.", type: "IA-A", prompt: "Graba el sonido de la bocina." },
            { id: "au_motor", name: "Ruido del Motor", desc: "Patrones anómalos.", type: "IA-A", prompt: "Graba el sonido del motor en ralentí." }
        ]
    },
    {
        category: "4. Seguridad y Equipo (Manual)",
        icon: "fa-hand-pointer",
        items: [
            { id: "mn_frenos", name: "Estado de Frenos", desc: "Tacto y firmeza del pedal.", type: "USR" },
            { id: "mn_direccion", name: "Dirección", desc: "¿El giro es suave y preciso?", type: "USR" },
            { id: "mn_ac", name: "Aire acondicionado", desc: "¿Enfría correctamente?", type: "USR" }
        ]
    }
];
