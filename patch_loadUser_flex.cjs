const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /      if \(tgUser && tgUser\.id && tgUser\.id !== 1 && tgUser\.id !== 9999\) \{[\s\S]*?console\.log\("New referral user registered on server immediately!"\);\n\n        setStatsLoaded\(true\);\n      \}/g;

console.log(code.match(regex)[0]);
