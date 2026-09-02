const fs = require('fs');

let content = fs.readFileSync('src/api.ts', 'utf8');

const additionalExports = `
export async function submitGameSolve(payload: { formula: string, digits: string[], elapsedTimeMs: number, gameMode: string }): Promise<any> {
  const headers = getAuthHeader();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(\`\${API_URL}/api/game/solve\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (e) {
    console.error("Failed to submit game solve", e);
    return null;
  }
}

export async function submitGameSkip(payload: { gameMode: string }): Promise<any> {
  const headers = getAuthHeader();
  if (!headers.Authorization) return null;
  try {
    const res = await fetch(\`\${API_URL}/api/game/skip\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (e) {
    console.error("Failed to submit game skip", e);
    return null;
  }
}
`;

content += additionalExports;

fs.writeFileSync('src/api.ts', content, 'utf8');
