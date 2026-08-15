const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/        setStatsLoaded\(true\);\n        return;/g, 
"        isStatsLoadedRef.current = true;\n        setStatsLoaded(true);\n        return;");

code = code.replace(/        setStatsLoaded\(true\);\n      \}/g, 
"        isStatsLoadedRef.current = true;\n        setStatsLoaded(true);\n      }");

fs.writeFileSync('src/App.tsx', code);
console.log("Patched setStatsLoaded with isStatsLoadedRef.current = true");
