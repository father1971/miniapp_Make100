const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf8');
code = code.replace(/await fetch\(\`\$\{API_URL\}\/api\/user\`, \{\s*method: 'POST'/g, "await fetch(`${API_URL}/api/score`, {\n      method: 'POST'");
fs.writeFileSync('src/api.ts', code);
