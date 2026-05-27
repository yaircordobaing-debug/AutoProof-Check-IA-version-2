with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('<div id="view-dashboard"')
end = content.find('<!-- 5. TRIP SETUP VIEW -->')

if start != -1 and end != -1:
    print(content[start:start+2000])
