export const saasCompanies = {
    "transbus": {
        id: "transbus",
        name: "TransBus S.A.",
        type: "buses",
        logo: "fa-bus",
        color: "#3B4953", // Slate Navy
        themeClass: "from-slateNavy/80 to-slate-900",
        accentClass: "bg-slateNavy hover:bg-slateNavy/80 text-white",
        textAccentClass: "text-sage",
        borderAccentClass: "border-slateNavy",
        modules: { obd: true, voice: false, gps: true },
        iaPeriodicity: "semanal",
        metrics: [
            { label: "Pasajeros Hoy", value: "3,420", icon: "fa-users" },
            { label: "Rutas Activas", value: "14 / 16", icon: "fa-route" },
            { label: "Inspecciones Emergencia", value: "2", icon: "fa-kit-medical" }
        ],
        vehicles: [
            { plate: "BUS-001", brand: "Mercedes-Benz", model: "Sprinter", mileage: 45200, lastOilChangeKm: 42000, driver: "Carlos Gómez", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Vence en 30 días" },
            { plate: "BUS-002", brand: "Volvo", model: "B12R", mileage: 128000, lastOilChangeKm: 125000, driver: "Andrés Ruiz", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Al día" },
            { plate: "BUS-003", brand: "Chevrolet", model: "NKR", mileage: 68900, lastOilChangeKm: 65000, driver: "Mariana Torres", status: "ADVERTENCIA", accidents: 1, alerts: ["Luz interna delantera apagada"], docs: "Técnico-Mecánica: Vence en 5 días" }
        ],
        drivers: [
            { name: "Carlos Gómez", email: "carlos.gomez@transbus.co", role: "Conductor Senior" },
            { name: "Andrés Ruiz", email: "andres.ruiz@transbus.co", role: "Conductor Junior" },
            { name: "Mariana Torres", email: "mariana.torres@transbus.co", role: "Conductora" }
        ]
    },
    "logitruck": {
        id: "logitruck",
        name: "LogiTruck Logistics",
        type: "camiones",
        logo: "fa-truck",
        color: "#90AB8B", // Dry Sage / Cambridge
        themeClass: "from-sage/80 to-slate-900",
        accentClass: "bg-sage hover:bg-sage/80 text-white",
        textAccentClass: "text-mint",
        borderAccentClass: "border-sage",
        modules: { obd: true, voice: true, gps: true },
        iaPeriodicity: "quincenal",
        metrics: [
            { label: "Tonelaje Carga", value: "142.5 Ton", icon: "fa-weight-hanging" },
            { label: "Rutas Nacionales", value: "8 Activas", icon: "fa-road" },
            { label: "Desgaste Llantas", value: "Crítico en TRK-102", icon: "fa-circle-dot" }
        ],
        vehicles: [
            { plate: "TRK-101", brand: "Kenworth", model: "T680", mileage: 154000, lastOilChangeKm: 151000, driver: "Jorge Herrera", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Al día" },
            { plate: "TRK-102", brand: "International", model: "ProStar", mileage: 238000, lastOilChangeKm: 235000, driver: "Manuel Patiño", status: "NO APTO", accidents: 2, alerts: ["Desgaste extremo en llanta delantera derecha", "Fuga hidráulica detectada"], docs: "Técnico-Mecánica: Vencida" },
            { plate: "TRK-103", brand: "Scania", model: "R450", mileage: 92400, lastOilChangeKm: 90000, driver: "Liliana Prada", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Al día" }
        ],
        drivers: [
            { name: "Jorge Herrera", email: "jorge.herrera@logitruck.co", role: "Conductor Master" },
            { name: "Manuel Patiño", email: "manuel.patino@logitruck.co", role: "Conductor Profesional" },
            { name: "Liliana Prada", email: "liliana.prada@logitruck.co", role: "Conductora Nacional" }
        ]
    },
    "carfleet": {
        id: "carfleet",
        name: "CarFleet Express",
        type: "carros",
        logo: "fa-car",
        color: "#5A7863", // Fern Green
        themeClass: "from-fern/80 to-slate-900",
        accentClass: "bg-fern hover:bg-fern/80 text-white",
        textAccentClass: "text-sage",
        borderAccentClass: "border-fern",
        modules: { obd: false, voice: false, gps: true },
        iaPeriodicity: "semanal",
        metrics: [
            { label: "Eficiencia Comb.", value: "48 Km/G", icon: "fa-gas-pump" },
            { label: "Flota Urbana", value: "12 Activos", icon: "fa-city" },
            { label: "Inspecciones Rápidas", value: "18 Hoy", icon: "fa-bolt" }
        ],
        vehicles: [
            { plate: "CAR-501", brand: "Mazda", model: "Mazda 3", mileage: 12500, lastOilChangeKm: 10000, driver: "Juan Pérez", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Al día" },
            { plate: "CAR-502", brand: "Toyota", model: "Hilux", mileage: 42000, lastOilChangeKm: 39000, driver: "Camila Restrepo", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Al día" },
            { plate: "CAR-503", brand: "Chevrolet", model: "Onix", mileage: 12500, lastOilChangeKm: 10000, driver: "Mateo Ortiz", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Al día" }
        ],
        drivers: [
            { name: "Juan Pérez", email: "juan.perez@transporte.co", role: "Conductor Autorizado" },
            { name: "Camila Restrepo", email: "camila.restrepo@carfleet.co", role: "Conductor Ejecutivo" },
            { name: "Mateo Ortiz", email: "mateo.ortiz@carfleet.co", role: "Conductor Express" }
        ]
    }
};

export const globalSystemLogs = [
    { time: "09:42:01", type: "INFO", message: "Servidor principal online. Latencia: 12ms." },
    { time: "09:42:15", type: "INFO", message: "Conexión SMTP exitosa con host smtp.gmail.com:465" },
    { time: "09:43:08", type: "SUCCESS", message: "Inferencia IA Gemini 1.5 Flash completada para CAR-501 - Confianza: 98%" },
    { time: "09:44:50", type: "WARNING", message: "Consumo de API de Gemini ha alcanzado el 74% de la cuota diaria." },
    { time: "09:45:12", type: "ERROR", message: "Error temporal de lectura OBD-II en BUS-003. Sincronización reintentada exitosamente." }
];
