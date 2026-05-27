import re
with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the new login block
new_login_str = '''login: (isUser) => { 
        if (isUser) {
            const emailInput = $('#manualEmail') ? $('#manualEmail').value.trim().toLowerCase() : '';
            const passwordInput = $('#manualPassword') ? $('#manualPassword').value.trim() : '';
            
            if (!emailInput || !passwordInput) {
                showNotification("Por favor ingresa tu correo y contraseña");
                return;
            }

            let foundUser = null;
            let companyId = null;
            let type = null;

            // Check super admins
            import('./data/saasData.js').then(({ saasCompanies, superAdmins }) => {
                const superAdmin = superAdmins.find(sa => sa.email === emailInput && sa.password === passwordInput);
                if (superAdmin) {
                    foundUser = { ...superAdmin, companyId: 'global', vehicleType: 'all' };
                } else {
                    // Check companies
                    for (const compKey in saasCompanies) {
                        const comp = saasCompanies[compKey];
                        const driver = comp.drivers.find(d => d.email === emailInput && d.password === passwordInput);
                        if (driver) {
                            foundUser = { ...driver, companyId: comp.id, vehicleType: comp.type };
                            break;
                        }
                        const admin = comp.admins.find(a => a.email === emailInput && a.password === passwordInput);
                        if (admin) {
                            foundUser = { ...admin, companyId: comp.id, vehicleType: comp.type };
                            break;
                        }
                    }
                }

                if (foundUser) {
                    currentUser = foundUser;
                    showNotification(`Bienvenido ${foundUser.name}`);
                    applyCompanyBranding(foundUser.companyId, foundUser);
                    
                    if (foundUser.role === 'superadmin') {
                        navigate('super-admin');
                    } else if (foundUser.role === 'admin') {
                        navigate('admin-empresa');
                    } else {
                        navigate('dashboard');
                    }
                } else {
                    showNotification("Credenciales inválidas. Intenta de nuevo.");
                }
            });
        } else {
            currentUser = null;
            applyCompanyBranding(null, null);
            showNotification("Modo invitado activado (Funciones limitadas)");
            navigate('dashboard');
        }
    },'''

# We need to replace the old login logic with this new one
# The old login block starts at `login: (isUser) => {` and ends before `logout: () => {`
start_idx = content.find('login: (isUser) => {')
if start_idx != -1:
    end_idx = content.find('logout: () => {', start_idx)
    if end_idx != -1:
        # replace
        content = content[:start_idx] + new_login_str + '\n    ' + content[end_idx:]
        with open('src/main.js', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Login logic patched successfully.")
    else:
        print("Could not find end of login function")
else:
    print("Could not find start of login function")
