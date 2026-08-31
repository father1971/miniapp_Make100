import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded loading text
content = content.replace('СДЕЛАЙ 100', 'MAKE 100')
content = content.replace('Синхронизация с базой данных...', "{t?.syncingDb || 'Синхронизация с базой данных...'}")
content = content.replace('Make100', 'Make 100')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/translations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('title: "Make100"', 'title: "Make 100"')
content = content.replace('Make100', 'Make 100')

with open('src/translations.ts', 'w', encoding='utf-8') as f:
    f.write(content)
