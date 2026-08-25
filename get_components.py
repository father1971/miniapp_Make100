import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

print("TOP BAR:")
match = re.search(r'\{/\* Live Stopwatch & Character Counter \(Top Bar\) \*/\}.*?<div className="flex items-center gap-2\.5">', content, flags=re.DOTALL)
if match:
    print(match.group(0))

print("\nBUILDER:")
match = re.search(r'\{/\* Expression Builder \*/\}.*?\{/\* Keypad \*/\}', content, flags=re.DOTALL)
if match:
    print(match.group(0))

print("\nACTIONS:")
match = re.search(r'\{/\* Action Buttons \*/\}.*?</button>\s*</div>', content, flags=re.DOTALL)
if match:
    print(match.group(0))

print("\nGAP:")
match = re.search(r'function Gap\(\{.*?\{value \? \(', content, flags=re.DOTALL)
if match:
    print(match.group(0))

print("\nOPERATOR:")
match = re.search(r'function OperatorButton\(\{.*?\{icon\}', content, flags=re.DOTALL)
if match:
    print(match.group(0))
