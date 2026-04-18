export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

export function navigate(viewId, currentView, updateCallbacks = {}) {
    $$('.view').forEach(el => el.classList.add('hidden'));
    const target = $(`#view-${viewId}`);
    if (target) {
        target.classList.remove('hidden');
        target.style.animation = 'none';
        target.offsetHeight; 
        target.style.animation = null;
    }
    
    const bottomNav = $('#bottom-nav');
    const showNavViews = ['dashboard', 'history', 'settings', 'profile'];
    
    if (showNavViews.includes(viewId)) {
        bottomNav.classList.remove('hidden');
        $$('.nav-btn').forEach(btn => {
            btn.classList.remove('text-jungle', 'bg-jungle/10');
            btn.classList.add('text-gray-400');
        });
        const activeBtn = $(`#nav-${viewId}`);
        if (activeBtn) {
            activeBtn.classList.remove('text-gray-400');
            activeBtn.classList.add('text-jungle', 'bg-jungle/10');
        }
    } else {
        bottomNav.classList.add('hidden');
    }

    if (updateCallbacks[viewId]) {
        updateCallbacks[viewId]();
    }

    $('#main-content').scrollTop = 0;
    return viewId;
}

export function showNotification(msg) {
    const toast = $('#notification');
    $('#notificationText').innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
