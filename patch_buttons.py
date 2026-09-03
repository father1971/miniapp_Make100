import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Hint Button
content = content.replace(
    "            disabled={isHinting || won}",
    "            disabled={isHinting || won || isPending}"
)
content = content.replace(
    "backdrop-blur-md ${isHinting || won ? 'opacity-50 cursor-not-allowed' : ''}`}",
    "backdrop-blur-md ${isHinting || won || isPending ? 'opacity-50 pointer-events-none cursor-not-allowed' : ''}`}"
)

# Skip Button
content = content.replace(
    "            disabled={isHinting}",
    "            disabled={isHinting || isPending}"
)
content = content.replace(
    "${isHinting ? 'opacity-50 cursor-not-allowed bg-white/60 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 backdrop-blur-md' : noSolutionMessage",
    "${isHinting || isPending ? 'opacity-50 pointer-events-none cursor-not-allowed bg-white/60 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 backdrop-blur-md' : noSolutionMessage"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
