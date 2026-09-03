import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_fetch = """  const fetchRandomTicket = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/tickets/random`);"""
new_fetch = """  const fetchRandomTicket = useCallback(async () => {
    setIsVisualReady(false);
    try {
      const response = await fetch(`${API_URL}/api/tickets/random`);"""
content = content.replace(old_fetch, new_fetch)

with open('src/App.tsx', 'w') as f:
    f.write(content)
