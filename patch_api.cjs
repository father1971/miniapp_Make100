const fs = require('fs');
let code = fs.readFileSync('src/api.ts', 'utf8');
code = code.replace('function getAuthHeader', 'export function getAuthHeader');
fs.writeFileSync('src/api.ts', code);
