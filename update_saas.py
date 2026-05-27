data = '''export const saasCompanies = {
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
            { id: "v1", plate: "BUS-001", brand: "Mercedes-Benz", model: "Sprinter", mileage: 45200, lastOilChangeKm: 42000, driver: "Carlos Gómez", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Vence en 30 días" },
            { id: "v2", plate: "BUS-002", brand: "Volvo", model: "B12R", mileage: 128000, lastOilChangeKm: 125000, driver: "Andrés Ruiz", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Al día" },
            { id: "v3", plate: "BUS-003", brand: "Chevrolet", model: "NKR", mileage: 68900, lastOilChangeKm: 65000, driver: "Mariana Torres", status: "ADVERTENCIA", accidents: 1, alerts: ["Luz interna delantera apagada"], docs: "Técnico-Mecánica: Vence en 5 días" }
        ],
        drivers: [
            { id: "d1", name: "Carlos Gómez", email: "carlos.gomez@transbus.co", role: "driver", password: "123" },
            { id: "d2", name: "Andrés Ruiz", email: "andres.ruiz@transbus.co", role: "driver", password: "123" },
            { id: "d3", name: "Mariana Torres", email: "mariana.torres@transbus.co", role: "driver", password: "123" }
        ],
        admins: [
            { id: "a1", name: "Admin TransBus", email: "admin@transbus.co", role: "admin", password: "admin123" }
        ],
        alertsHistory: [
            { id: "al1", type: "documento", message: "SOAT BUS-001 vence pronto", date: "2026-05-20", severity: "medium" }
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
            { id: "v4", plate: "TRK-101", brand: "Kenworth", model: "T680", mileage: 154000, lastOilChangeKm: 151000, driver: "Jorge Herrera", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Al día" },
            { id: "v5", plate: "TRK-102", brand: "International", model: "ProStar", mileage: 238000, lastOilChangeKm: 235000, driver: "Manuel Patiño", status: "NO APTO", accidents: 2, alerts: ["Desgaste extremo en llanta delantera derecha", "Fuga hidráulica detectada"], docs: "Técnico-Mecánica: Vencida" },
            { id: "v6", plate: "TRK-103", brand: "Scania", model: "R450", mileage: 92400, lastOilChangeKm: 90000, driver: "Liliana Prada", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Al día" }
        ],
        drivers: [
            { id: "d4", name: "Jorge Herrera", email: "jorge.herrera@logitruck.co", role: "driver", password: "123" },
            { id: "d5", name: "Manuel Patiño", email: "manuel.patino@logitruck.co", role: "driver", password: "123" },
            { id: "d6", name: "Liliana Prada", email: "liliana.prada@logitruck.co", role: "driver", password: "123" }
        ],
        admins: [
            { id: "a2", name: "Admin LogiTruck", email: "admin@logitruck.co", role: "admin", password: "admin123" }
        ],
        alertsHistory: [
            { id: "al2", type: "riesgo_ia", message: "TRK-102: Desgaste crítico en llantas detectado por IA", date: "2026-05-24", severity: "high" }
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
            { id: "v7", plate: "CAR-501", brand: "Mazda", model: "Mazda 3", mileage: 12500, lastOilChangeKm: 10000, driver: "Juan Pérez", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Al día" },
            { id: "v8", plate: "CAR-502", brand: "Toyota", model: "Hilux", mileage: 42000, lastOilChangeKm: 39000, driver: "Camila Restrepo", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Al día" },
            { id: "v9", plate: "CAR-503", brand: "Chevrolet", model: "Onix", mileage: 12500, lastOilChangeKm: 10000, driver: "Mateo Ortiz", status: "APTO", accidents: 0, alerts: [], docs: "SOAT: Al día" }
        ],
        drivers: [
            { id: "d7", name: "Juan Pérez", email: "juan.perez@transporte.co", role: "driver", password: "123" },
            { id: "d8", name: "Camila Restrepo", email: "camila.restrepo@carfleet.co", role: "driver", password: "123" },
            { id: "d9", name: "Mateo Ortiz", email: "mateo.ortiz@carfleet.co", role: "driver", password: "123" }
        ],
        admins: [
            { id: "a3", name: "Admin CarFleet", email: "admin@carfleet.co", role: "admin", password: "admin123" }
        ],
        alertsHistory: []
    }
};

export const globalSystemLogs = [
    { time: "09:42:01", type: "INFO", message: "Servidor principal online. Latencia: 12ms." },
    { time: "09:42:15", type: "INFO", message: "Conexión SMTP exitosa con host smtp.gmail.com:465" },
    { time: "09:43:08", type: "SUCCESS", message: "Inferencia IA Gemini 1.5 Flash completada para CAR-501 - Confianza: 98%" },
    { time: "09:44:50", type: "WARNING", message: "Consumo de API de Gemini ha alcanzado el 74% de la cuota diaria." },
    { time: "09:45:12", type: "ERROR", message: "Error temporal de lectura OBD-II en BUS-003. Sincronización reintentada exitosamente." }
];

export const superAdmins = [
    { id: "sa1", name: "Super Admin Global", email: "super@autoproof.co", role: "superadmin", password: "super" }
];
'''

with open('src/data/saasData.js', 'w', encoding='utf-8') as f:
    f.write(data)
