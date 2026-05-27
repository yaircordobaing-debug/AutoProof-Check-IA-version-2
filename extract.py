import re
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start1 = content.find('<div id="view-admin-empresa"')
end1 = content.find('<!-- B. SUPER ADMIN VIEW -->')
with open('admin_empresa.html', 'w', encoding='utf-8') as f:
    f.write(content[start1:end1])

start2 = content.find('<div id="view-super-admin"')
end2 = content.find('<!-- SCRIPTS -->')
with open('super_admin.html', 'w', encoding='utf-8') as f:
    f.write(content[start2:end2])

print("Extracted successfully")
