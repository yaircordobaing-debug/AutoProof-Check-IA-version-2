export const inspectionData = [
    {
        category: "1. Exterior (Manual)",
        icon: "fa-hand-pointer",
        items: [
            { id: "ia_fugas", name: "Fugas en el suelo", desc: "Detección de líquidos bajo el motor.", type: "USR" },
            { id: "ia_vidrio_panoramico", name: "Vidrio Panorámico", desc: "Fisuras o impactos frontales.", type: "USR" },
            { id: "ia_vidrio_trasero", name: "Vidrio Trasero", desc: "Visibilidad e integridad posterior.", type: "USR" },
            { id: "ia_llantas_visual", name: "Estado Visual Llantas", desc: "Cortes, deformaciones o hernias (4 llantas).", type: "USR" },
            { id: "ia_luces_frente", name: "Luces Altas y Bajas", desc: "Intensidad y funcionamiento.", type: "USR" },
            { id: "ia_luces_direc", name: "Direccionales", desc: "Flasher y funcionamiento rítmico.", type: "USR" },
            { id: "ia_luces_stop", name: "Luces de Stop", desc: "Intensidad al frenar.", type: "USR" },
            { id: "ia_documentos", name: "Documentos (OCR)", desc: "SOAT y Técnico-Mecánica.", type: "USR" },
            { id: "mn_plumillas", name: "Limpia Parabrisas", desc: "Estado de las plumillas y barrido.", type: "USR" },
            { id: "mn_kit_carretera", name: "Kit de Carretera (COL)", desc: "Extintor, botiquín, señales.", type: "USR" },
            { id: "mn_cinturon_cond", name: "Cinturón Conductor", desc: "Anclaje y tensión.", type: "USR" },
            { id: "mn_cinturon_copiloto", name: "Cinturón Copiloto", desc: "Anclaje y tensión.", type: "USR" }
        ]
    },
    {
        category: "2. Mediciones Técnicas (Manual)",
        icon: "fa-ruler",
        items: [
            { id: "hy_presion", name: "Presión de Llantas", desc: "Medición en PSI (4 llantas).", type: "USR" },
            { id: "hy_labrado", name: "Profundidad de Labrado", desc: "Mínimo legal 1.6mm (4 llantas).", type: "USR" },
            { id: "hy_aceite", name: "Nivel de Aceite", desc: "Medición por varilla.", type: "USR" }
        ]
    },
    {
        category: "3. Diagnóstico Acústico (Manual)",
        icon: "fa-microphone-lines",
        items: [
            { id: "au_claxon", name: "Claxon", desc: "Intensidad sonora.", type: "USR" },
            { id: "au_motor", name: "Ruido del Motor", desc: "Patrones anómalos.", type: "USR" }
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
