const fs = require('fs');
let content = fs.readFileSync('src/api.ts', 'utf8');
content = content.replace('  solvedCount: number;\n  skippedCount: number;', '  solvedCount?: number;\n  skippedCount?: number;');
content = content.replace('  totalTimeMs: number;\n  totalCharacters: number;', '  totalTimeMs?: number;\n  totalCharacters?: number;');
fs.writeFileSync('src/api.ts', content, 'utf8');
