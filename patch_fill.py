import re

with open('src/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

func_str = '''fillCredentials: (email, password) => {
        const emailEl = $('#manualEmail');
        const passEl = $('#manualPassword');
        if (emailEl) emailEl.value = email;
        if (passEl) passEl.value = password;
        
        window.appActions.login(true);
    },'''

# Insert it at the start of appActions
start_actions = content.find('window.appActions = {')
if start_actions != -1:
    insert_point = content.find('\n', start_actions) + 1
    content = content[:insert_point] + '    ' + func_str + '\n' + content[insert_point:]
    
    with open('src/main.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched fillCredentials successfully.")
else:
    print("Could not find window.appActions")
