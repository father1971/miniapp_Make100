const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Revert earlier change of isSkip passing timeSpentMs
code = code.replace(
  /    if \(isSkip\) \{\n      const timeSpentMs = Date.now\(\) - puzzleStartTimeRef\.current;\n      handleGameUpdate\(false, 0, timeSpentMs\);/g,
  "    if (isSkip) {\n      handleGameUpdate(false, 0, elapsedTime);"
);

// 2. Revert isWin passing timeSpentMs
const isWinRegex2 = /      const timeSpentMs = Date.now\(\) - puzzleStartTimeRef\.current;\n      const operatorsUsed = gaps\.join\(''\)\.replace\(\/\[0-9\.\]\/g, ''\)\.length;\n      handleGameUpdate\(true, operatorsUsed, timeSpentMs\);/;
const revertIsWin = `      const operatorsUsed = gaps.join('').replace(/[0-9.]/g, '').length;
      handleGameUpdate(true, operatorsUsed, elapsedTime);`;
code = code.replace(isWinRegex2, revertIsWin);

// 3. Update handleGameUpdate implementation
const handleGameUpdateDef = /const handleGameUpdate = useCallback\(\(isSolved: boolean, solutionLength: number, timeSpent: number\) => \{/;
const newHandleGameUpdateDef = `const handleGameUpdate = useCallback((isSolved: boolean, solutionLength: number, timeSpent: number) => {
    const timeSpentMs = Date.now() - puzzleStartTimeRef.current;`;
code = code.replace(handleGameUpdateDef, newHandleGameUpdateDef);

// Replace bestTimeMs in modeStats update
const modeStatsBestTime = /bestTimeMs: isSolved\n            \? \(currentModeStats\.bestTimeMs === null \? timeSpent : Math\.min\(currentModeStats\.bestTimeMs, timeSpent\)\)/;
const newModeStatsBestTime = `bestTimeMs: isSolved
            ? (currentModeStats.bestTimeMs === null ? timeSpentMs : Math.min(currentModeStats.bestTimeMs, timeSpentMs))`;
code = code.replace(modeStatsBestTime, newModeStatsBestTime);

// Update setBestTimeMs logic to use timeSpentMs
const setBestTimeLogic = /      setBestTimeMs\(prev => \{\n        const previousBest = prev \|\| Infinity;\n        const isNewRecord = timeSpent < previousBest;\n        \n        if \(isNewRecord\) \{\n          console\.log\(`\[New Global Record!\] Старый рекорд побит: \$\{previousBest\}мс -> \$\{timeSpent\}мс`\);\n          \n          try \{\n            import\('canvas-confetti'\)\.then\(\(confetti\) => \{\n              confetti\.default\(\{\n                particleCount: 150,\n                spread: 80,\n                origin: \{ y: 0\.6 \}\n              \}\);\n            \}\);\n          \} catch \(e\) \{\n            console\.warn\("Библиотека конфетти недоступна", e\);\n          \}\n          \n          if \(vibrationEnabled && \(window as any\)\.Telegram\?\.WebApp\?\.HapticFeedback\) \{\n            \(window as any\)\.Telegram\.WebApp\.HapticFeedback\.notificationOccurred\('success'\);\n          \}\n          \n          setNewRecordTimeMs\(timeSpent\);\n          return timeSpent;\n        \}\n        return prev;\n      \}\);/;

const newSetBestTimeLogic = `      setBestTimeMs(prev => {
        const previousBest = prev || Infinity;
        const isNewRecord = timeSpentMs < previousBest;
        
        if (isNewRecord) {
          console.log(\`[New Global Record!] Старый рекорд побит: \${previousBest}мс -> \${timeSpentMs}мс\`);
          
          try {
            import('canvas-confetti').then((confetti) => {
              confetti.default({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
              });
            });
          } catch (e) {
            console.warn("Библиотека конфетти недоступна", e);
          }
          
          if (vibrationEnabled && (window as any).Telegram?.WebApp?.HapticFeedback) {
            (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          }
          
          setNewRecordTimeMs(timeSpentMs);
          return timeSpentMs;
        }
        return prev;
      });`;

code = code.replace(setBestTimeLogic, newSetBestTimeLogic);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched to keep seconds for total and use ms for best.");
