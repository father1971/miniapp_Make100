const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add puzzleStartTimeRef & newRecordTimeMs
code = code.replace(
  "  const [bestTimeMs, setBestTimeMs] = useState<number | null>(null);",
  "  const [bestTimeMs, setBestTimeMs] = useState<number | null>(null);\n  const [newRecordTimeMs, setNewRecordTimeMs] = useState<number | null>(null);\n  const puzzleStartTimeRef = useRef(Date.now());"
);

// 2. Reset in initGame
code = code.replace(
  "setElapsedTime(0);",
  "setElapsedTime(0);\n    puzzleStartTimeRef.current = Date.now();\n    setNewRecordTimeMs(null);"
);

// 3. Skip update uses ms
code = code.replace(
  /    if \(isSkip\) \{\n      handleGameUpdate\(false, 0, elapsedTime\);/g,
  "    if (isSkip) {\n      const timeSpentMs = Date.now() - puzzleStartTimeRef.current;\n      handleGameUpdate(false, 0, timeSpentMs);"
);

// 4. Update isWin effect to use timeSpentMs and remove playVibration('success') since handleGameUpdate does it.
const isWinRegex = /  useEffect\(\(\) => \{\n    if \(isWin && !won && !hintUsed\) \{\n      setWon\(true\);\n      setGameState\('idle'\);\n      playSound\('success'\);\n      playVibration\('success'\);\n      \n      \/\/ Update statistics via handleGameUpdate\n      const operatorsUsed = gaps\.join\(''\)\.replace\(\/\[0-9\.\]\/g, ''\)\.length;\n      handleGameUpdate\(true, operatorsUsed, elapsedTime\);\n      \n      setSelectedSlot\(null\);\n    \}\n  \}, \[isWin, won, hintUsed, elapsedTime, gaps, playSound, playVibration, tgUser, digits, handleGameUpdate\]\);/;

const newIsWin = `  useEffect(() => {
    if (isWin && !won && !hintUsed) {
      setWon(true);
      setGameState('idle');
      playSound('success');
      
      const timeSpentMs = Date.now() - puzzleStartTimeRef.current;
      const operatorsUsed = gaps.join('').replace(/[0-9.]/g, '').length;
      handleGameUpdate(true, operatorsUsed, timeSpentMs);
      
      setSelectedSlot(null);
    }
  }, [isWin, won, hintUsed, gaps, playSound, tgUser, digits, handleGameUpdate]);`;

code = code.replace(isWinRegex, newIsWin);

// 5. Update handleGameUpdate with the bestTimeMs logic
const handleGameUpdateRegex = /      setBestTimeMs\(prev => \(prev === null \|\| timeSpent < prev\) \? timeSpent : prev\);/;
const newBestTimeUpdate = `      setBestTimeMs(prev => {
        const previousBest = prev || Infinity;
        const isNewRecord = timeSpent < previousBest;
        
        if (isNewRecord) {
          console.log(\`[New Global Record!] Старый рекорд побит: \${previousBest}мс -> \${timeSpent}мс\`);
          
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
          
          setNewRecordTimeMs(timeSpent);
          return timeSpent;
        }
        return prev;
      });`;

code = code.replace(handleGameUpdateRegex, newBestTimeUpdate);

// 6. Update handleGameUpdate deps to include vibrationEnabled
code = code.replace(
  /    \}\n  \}, \[gameMode\]\);/,
  "    }\n  }, [gameMode, vibrationEnabled]);"
);

// 7. Inject UI banner
const uiRegex = /<h2 className="text-4xl sm:text-5xl font-black mb-3 tracking-tighter">\{t\.perfect\}<\/h2>/;
const newUI = `<h2 className="text-4xl sm:text-5xl font-black mb-3 tracking-tighter">{t.perfect}</h2>
              {newRecordTimeMs && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 py-2 px-4 rounded-xl mb-6 font-bold text-lg inline-flex items-center gap-2 border border-orange-200 dark:border-orange-500/30 shadow-sm mx-auto"
                >
                  ⚡️ НОВЫЙ РЕКОРД: {(newRecordTimeMs / 1000).toFixed(2)} сек!
                </motion.div>
              )}`;

code = code.replace(uiRegex, newUI);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched speed record successfully");
