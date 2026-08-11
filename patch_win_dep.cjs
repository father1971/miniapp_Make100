const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /  \}, \[isWin, won, hintUsed, elapsedTime, gaps, playSound, playVibration, solvedCount, totalSolveTime, totalOperatorsUsed, tgUser, gameMode, digits\]\);/,
  "  }, [isWin, won, hintUsed, elapsedTime, gaps, playSound, playVibration, tgUser, digits, handleGameUpdate]);"
);
fs.writeFileSync('src/App.tsx', code);
