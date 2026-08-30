import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Top Bar
content = content.replace(
    'bg-white dark:bg-slate-900/70 border border-zinc-200 dark:border-slate-800/60 backdrop-blur-md shadow-md',
    'bg-white/70 dark:bg-slate-900/70 border border-zinc-200/70 dark:border-slate-800/60 backdrop-blur-md shadow-md'
)

# 2. Expression Builder container
content = content.replace(
    'bg-white border border-zinc-200',
    'bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md dark:backdrop-blur-2xl border border-zinc-200/70 dark:border-zinc-800/60'
)

# 3. Action Buttons (bottom)
content = content.replace(
    'bg-white dark:bg-zinc-900/95 border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 backdrop-blur-md',
    'bg-white/70 dark:bg-zinc-900/70 border-zinc-300/70 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70 backdrop-blur-md'
)
content = content.replace(
    'bg-white border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100',
    'bg-white/70 dark:bg-zinc-900/70 border-zinc-300/70 dark:border-zinc-800/50 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70 backdrop-blur-md'
)
content = content.replace(
    'text-red-500 bg-red-50 hover:bg-red-100',
    'text-red-500 dark:text-red-400 bg-red-50/70 dark:bg-red-900/30 hover:bg-red-100/70 dark:hover:bg-red-900/50 backdrop-blur-md'
)

# 4. Operator Buttons
content = content.replace(
    "variant === 'danger' ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100 hover:border-red-200 shadow-sm' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm'",
    "variant === 'danger' ? 'bg-red-50/70 dark:bg-red-500/20 text-red-500 dark:text-red-400 border-red-100/70 dark:border-red-500/30 hover:bg-red-100/70 dark:hover:bg-red-500/30 hover:border-red-200/70 dark:hover:border-red-500/50 shadow-sm backdrop-blur-md' : 'bg-white/70 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 border-zinc-200/70 dark:border-zinc-700/70 hover:bg-zinc-50/70 dark:hover:bg-zinc-700/70 hover:border-zinc-300/70 dark:hover:border-zinc-600/70 shadow-sm backdrop-blur-md'"
)

# 5. Header badges / buttons
content = content.replace(
    'bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm',
    'bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-slate-200/70 dark:border-slate-800/60 shadow-sm backdrop-blur-md'
)

content = content.replace(
    'from-amber-500 to-yellow-400 text-white',
    'from-amber-500/70 to-yellow-400/70 text-white backdrop-blur-md'
)

# 6. Gaps inside Expression Builder
content = content.replace(
    'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
    'bg-orange-50/70 dark:bg-orange-500/30 text-orange-600 dark:text-orange-400 backdrop-blur-md'
)
content = content.replace(
    'bg-orange-50 text-orange-600',
    'bg-orange-50/70 dark:bg-orange-500/30 text-orange-600 backdrop-blur-md'
)
content = content.replace(
    'border-zinc-800 dark:border-zinc-200 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900',
    'border-zinc-800/70 dark:border-zinc-200/70 bg-zinc-800/70 dark:bg-zinc-200/70 text-white dark:text-zinc-900 backdrop-blur-md'
)
content = content.replace(
    'border-zinc-800 bg-zinc-800 text-white',
    'border-zinc-800/70 dark:border-zinc-200/70 bg-zinc-800/70 dark:bg-zinc-200/70 text-white dark:text-zinc-900 backdrop-blur-md'
)
content = content.replace(
    'border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900',
    'border-dashed border-zinc-300/70 dark:border-zinc-700/70 hover:border-zinc-400/70 dark:hover:border-zinc-500/70 text-zinc-400 dark:text-zinc-500 bg-zinc-50/70 dark:bg-zinc-900/70 backdrop-blur-md'
)
content = content.replace(
    'border-dashed border-zinc-300 hover:border-zinc-400 text-zinc-400 bg-zinc-50',
    'border-dashed border-zinc-300/70 dark:border-zinc-700/70 hover:border-zinc-400/70 dark:hover:border-zinc-500/70 text-zinc-400 dark:text-zinc-500 bg-zinc-50/70 dark:bg-zinc-900/70 backdrop-blur-md'
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
