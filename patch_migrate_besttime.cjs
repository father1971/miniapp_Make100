const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /setBestTimeMs\(data\.bestTimeMs \?\? null\);/;
const replace = `let loadedBestTime = data.bestTimeMs ?? null;
        // Migrate old records stored in seconds to milliseconds
        if (loadedBestTime !== null && loadedBestTime < 1000) {
          loadedBestTime = loadedBestTime * 1000;
        }
        setBestTimeMs(loadedBestTime);`;

code = code.replace(regex, replace);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched migration logic for bestTimeMs");
