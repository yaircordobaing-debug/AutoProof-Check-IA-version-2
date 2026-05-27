with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()
start = content.find('<div id="view-admin-empresa"')
end = content.find('<!-- 14. SUPER ADMIN VIEW -->')
if start != -1 and end != -1:
    with open('admin_empresa.html', 'w', encoding='utf-8') as f:
        f.write(content[start:end])
    print("Extracted to admin_empresa.html")
