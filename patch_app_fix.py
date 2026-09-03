import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I want to remove the specific "      )}" at the end.
content = content.replace("      )}\n    </div>\n  );\n}", "    </div>\n  );\n}")

with open('src/App.tsx', 'w') as f:
    f.write(content)

