const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /\}, \[solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, bestTimeMs, minCharacters, theme, language, gameMode, soundEnabled, vibrationEnabled, statsLoaded, tgUser\]\);/,
  '}, [solvedCount, unsolvedCount, totalSolveTime, totalOperatorsUsed, bestTimeMs, minCharacters, theme, language, gameMode, soundEnabled, vibrationEnabled, statsLoaded, tgUser, modeStats]);'
);

fs.writeFileSync('src/App.tsx', code);
