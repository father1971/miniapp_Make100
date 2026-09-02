const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regexHandleUpdate = /const handleGameUpdate = useCallback\([\s\S]*?\}, \[gameMode\]\);/g;
content = content.replace(regexHandleUpdate, '');

content = content.replace(/handleGameUpdate\(false, 0, timeSpentMs\);/g, '');

content = content.replace(/handleGameUpdate/g, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
