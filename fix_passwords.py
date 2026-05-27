with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix driver passwords
content = content.replace("'carlos.gomez@transbus.co', 'carlos123'", "'carlos.gomez@transbus.co', '123'")
content = content.replace("'jorge.herrera@logitruck.co', 'jorge123'", "'jorge.herrera@logitruck.co', '123'")
content = content.replace("'juan.perez@transporte.co', 'juan123'", "'juan.perez@transporte.co', '123'")

# Fix old superadmin
content = content.replace("'superadmin@opercheck.ia', 'superadmin123'", "'super@autoproof.co', 'super'")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed passwords in index.html")
