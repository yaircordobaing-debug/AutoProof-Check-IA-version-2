import re
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.findall(r'<div\s+id="(view-[^"]+)"', content)
print("Views in index.html:")
for m in matches:
    print(m)
