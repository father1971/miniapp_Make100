const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Patch handleSkip
content = content.replace(
  "const handleSkip = async () => {\\n    if (isHinting) return;",
  "const handleSkip = async () => {\\n    if (isHinting || isPending) return;\\n    setIsPending(true);"
);

content = content.replace(
  "// trigger next round\\n    initGame(false, true);\\n  };",
  "// trigger next round\\n    initGame(false, true);\\n    setIsPending(false);\\n  };"
);

// Patch submitGameSolve
const oldSubmit = \`      submitGameSolve({
        formula: fullExpression,
        digits: digits,
        elapsedTimeMs: exactSolveTimeMs,
        gameMode: gameMode
      }).then(res => {\`;

const newSubmit = \`      setIsPending(true);
      submitGameSolve({
        formula: fullExpression,
        digits: digits,
        elapsedTimeMs: exactSolveTimeMs,
        gameMode: gameMode
      }).then(res => {\`;

content = content.replace(oldSubmit, newSubmit);

const oldSubmitEnd = \`             if (tg?.HapticFeedback?.notificationOccurred) {
               try { tg.HapticFeedback.notificationOccurred('success'); } catch (e) {}
             }
          }
        }
      });\`;

const newSubmitEnd = \`             if (tg?.HapticFeedback?.notificationOccurred) {
               try { tg.HapticFeedback.notificationOccurred('success'); } catch (e) {}
             }
          }
        }
      }).finally(() => {
        setIsPending(false);
      });\`;

content = content.replace(oldSubmitEnd, newSubmitEnd);

fs.writeFileSync('src/App.tsx', content, 'utf8');
