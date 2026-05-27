with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_btn = 'onclick="window.appActions.showPreopIAModal()"'
new_btn = 'onclick="startPreoperacional(true)"'

content = content.replace(old_btn, new_btn)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched Preoperacional IA button")
