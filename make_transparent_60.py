import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace /70 with /60 across all recently modified elements
content = content.replace('bg-white/70', 'bg-white/60')
content = content.replace('dark:bg-slate-900/70', 'dark:bg-slate-900/60')
content = content.replace('border-slate-200/70', 'border-slate-200/60')
content = content.replace('border-zinc-200/70', 'border-zinc-200/60')

content = content.replace('dark:bg-zinc-900/70', 'dark:bg-zinc-900/60')
content = content.replace('dark:bg-zinc-800/70', 'dark:bg-zinc-800/60')
content = content.replace('bg-zinc-800/70', 'bg-zinc-800/60')
content = content.replace('dark:bg-zinc-200/70', 'dark:bg-zinc-200/60')
content = content.replace('border-zinc-300/70', 'border-zinc-300/60')
content = content.replace('hover:bg-zinc-100/70', 'hover:bg-zinc-100/60')
content = content.replace('dark:hover:bg-zinc-800/70', 'dark:hover:bg-zinc-800/60')
content = content.replace('dark:hover:bg-zinc-700/70', 'dark:hover:bg-zinc-700/60')

content = content.replace('bg-red-50/70', 'bg-red-50/60')
content = content.replace('border-red-100/70', 'border-red-100/60')
content = content.replace('hover:bg-red-100/70', 'hover:bg-red-100/60')
content = content.replace('hover:border-red-200/70', 'hover:border-red-200/60')

content = content.replace('bg-orange-50/70', 'bg-orange-50/60')
content = content.replace('from-amber-500/70', 'from-amber-500/60')
content = content.replace('to-yellow-400/70', 'to-yellow-400/60')

content = content.replace('border-zinc-800/70', 'border-zinc-800/60')
content = content.replace('dark:border-zinc-200/70', 'dark:border-zinc-200/60')
content = content.replace('dark:border-zinc-700/70', 'dark:border-zinc-700/60')
content = content.replace('hover:border-zinc-400/70', 'hover:border-zinc-400/60')
content = content.replace('dark:hover:border-zinc-500/70', 'dark:hover:border-zinc-500/60')
content = content.replace('bg-zinc-50/70', 'bg-zinc-50/60')

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
