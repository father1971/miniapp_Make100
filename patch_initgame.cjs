const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /  \}, \[playSound, playVibration, language\]\);/,
  "  }, [playSound, playVibration, language, handleGameUpdate, elapsedTime]);"
);
fs.writeFileSync('src/App.tsx', code);
