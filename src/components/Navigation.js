export function renderBottomNav() {
    return `
        <nav id="bottom-nav" class="hidden bg-[#141a1f]/90 backdrop-blur-md border-t border-white/5 flex justify-around p-3 pb-5 sticky bottom-0 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] rounded-t-3xl">
            <button onclick="navigate('dashboard')" id="nav-dashboard" class="nav-btn flex flex-col items-center p-2 rounded-xl transition-colors text-gray-500 hover:text-white">
                <i class="fa-solid fa-house text-xl mb-1"></i>
                <span class="text-[10px] font-bold">INICIO</span>
            </button>
            <button onclick="navigate('history')" id="nav-history" class="nav-btn flex flex-col items-center p-2 rounded-xl transition-colors text-gray-500 hover:text-white">
                <i class="fa-solid fa-file-lines text-xl mb-1"></i>
                <span class="text-[10px] font-bold">REPORTES</span>
            </button>
            <button onclick="navigate('settings')" id="nav-settings" class="nav-btn flex flex-col items-center p-2 rounded-xl transition-colors text-gray-500 hover:text-white">
                <i class="fa-solid fa-gear text-xl mb-1"></i>
                <span class="text-[10px] font-bold">AJUSTES</span>
            </button>
            <button onclick="navigate('profile')" id="nav-profile" class="nav-btn flex flex-col items-center p-2 rounded-xl transition-colors text-gray-500 hover:text-white">
                <i class="fa-solid fa-user text-xl mb-1"></i>
                <span class="text-[10px] font-bold">PERFIL</span>
            </button>
        </nav>
    `;
}
