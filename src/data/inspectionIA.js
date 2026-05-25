export const weeklyIAItems = [
    { 
        id: "ia_desgaste_llantas", 
        name: "Desgaste de Llantas", 
        desc: "Análisis con IA de labrado y desgaste de bandas.", 
        type: "IA-V",
        prompt: "Analiza el desgaste de la llanta. Si la llanta está lisa, con grietas laterales o alambres expuestos, responde 'No Cumple' con baja confianza. Si está en óptimas condiciones, responde 'Cumple'."
    },
    { 
        id: "ia_vidrios_rotos", 
        name: "Vidrios y Parabrisas", 
        desc: "Detección automática de fisuras o impactos de piedras.", 
        type: "IA-V",
        prompt: "Inspecciona el parabrisas y vidrios en la foto. Si hay grietas radiales, fracturas o roturas, responde 'No Cumple' y describe la zona del daño."
    },
    { 
        id: "ia_golpes_visibles", 
        name: "Golpes y Abolladuras", 
        desc: "Verificación de la integridad de la carrocería.", 
        type: "IA-V",
        prompt: "Inspecciona si el vehículo presenta abolladuras, raspaduras fuertes o deformaciones en el parachoques o puertas."
    },
    { 
        id: "ia_luces_apagadas", 
        name: "Estado de Luces y Faros", 
        desc: "IA verifica si las luces están encendidas y funcionales.", 
        type: "IA-V",
        prompt: "Analiza los faros del vehículo. Si están apagados durante la prueba o rotos, responde 'No Cumple'."
    },
    { 
        id: "ia_humedad_fugas", 
        name: "Humedad y Fugas", 
        desc: "Detección de fluidos bajo el motor o charcos.", 
        type: "IA-V",
        prompt: "Verifica si hay charcos o humedad visible en el suelo bajo el motor."
    },
    { 
        id: "ia_objetos_faltantes", 
        name: "Objetos Faltantes", 
        desc: "Verificación del extintor y kit reglamentario.", 
        type: "IA-V",
        prompt: "Analiza la foto del kit de carretera. Si faltan elementos requeridos como conos, tacos o extintor, responde 'No Cumple'."
    }
];
