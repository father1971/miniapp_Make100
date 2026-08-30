import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the Top Bar (Stopwatch & Char Counter)
content = content.replace(
    'bg-slate-900/40 dark:bg-slate-900/70 border border-slate-800/60 backdrop-blur-md shadow-md',
    'bg-white dark:bg-slate-900/70 border border-zinc-200 dark:border-slate-800/60 backdrop-blur-md shadow-md'
)

# Divider inside the top bar
content = content.replace(
    'bg-slate-700/60 dark:bg-slate-800',
    'bg-zinc-200 dark:bg-slate-800'
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
