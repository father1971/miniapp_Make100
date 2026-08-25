import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Hint button
hint_btn = r'border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 backdrop-blur-md \$\{isHinting \|\| won \? \'opacity-50 cursor-not-allowed\' : \'\'\}'
hint_repl = r'bg-white/95 dark:bg-zinc-900/95 border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 backdrop-blur-md ${isHinting || won ? \'opacity-50 cursor-not-allowed\' : \'\'}'
content = re.sub(hint_btn, hint_repl, content)

# Skip button (isHinting)
skip_hint = r'\'opacity-50 cursor-not-allowed border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 backdrop-blur-md\''
skip_hint_repl = r'\'opacity-50 cursor-not-allowed bg-white/95 dark:bg-zinc-900/95 border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 backdrop-blur-md\''
content = re.sub(skip_hint, skip_hint_repl, content)

# Skip button (default)
skip_def = r'\'border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 backdrop-blur-md\''
skip_def_repl = r'\'bg-white/95 dark:bg-zinc-900/95 border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 backdrop-blur-md\''
content = re.sub(skip_def, skip_def_repl, content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
