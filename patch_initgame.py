import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove the old setIsVisualReady(false)
content = content.replace(
    "    setLetters(randomLetters);\n    setIsVisualReady(false);\n    // Set random car image",
    "    setLetters(randomLetters);\n    // Set random car image"
)

# Put it at the very top of initGame
content = content.replace(
    "  const initGame = useCallback((startAsIdle = false, isSkip = false) => {\n    setNoSolutionMessage(false);",
    "  const initGame = useCallback((startAsIdle = false, isSkip = false) => {\n    setIsVisualReady(false);\n    setNoSolutionMessage(false);"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
