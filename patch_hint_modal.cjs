const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state
code = code.replace(
  /  const \[isLeaderboardOpen, setIsLeaderboardOpen\] = useState\(false\);/,
  `  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);\n  const [showBuyHintModal, setShowBuyHintModal] = useState(false);`
);

// 2. Modify showHint
const oldShowHint = `  const showHint = () => {
    if (isHinting || won) return;
    
    const currentStats = statsRef.current;
    
    if (currentStats.hintsCount > 0) {
      setStats(prev => {
        const newStats = { ...prev, hintsCount: prev.hintsCount - 1 };
        return newStats;
      });
      showHintOnScreen();
    } else if (currentStats.coins >= 20) {
      setStats(prev => {
        const newStats = { ...prev, coins: prev.coins - 20, hintsCount: prev.hintsCount + 1 };
        return newStats;
      });
      window.alert("Куплена 1 подсказка за 20 🪙!");
    } else {
      window.alert("Недостаточно монет! Стоимость подсказки: 20 🪙");
    }
  };`;

const newShowHint = `  const showHint = () => {
    if (isHinting || won) return;
    
    const currentStats = statsRef.current;
    
    if (currentStats.hintsCount > 0) {
      setStats(prev => {
        const newStats = { ...prev, hintsCount: prev.hintsCount - 1 };
        return newStats;
      });
      showHintOnScreen();
    } else {
      setShowBuyHintModal(true);
    }
  };`;

code = code.replace(oldShowHint, newShowHint);

// 3. Inject Modal UI
const buyHintModalUi = `        {showBuyHintModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4"
            onClick={() => setShowBuyHintModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-zinc-100 dark:border-zinc-800 relative flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                <Lightbulb size={32} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-center mb-2">Подсказки закончились</h2>
              <p className="text-center text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                Ваш лимит подсказок исчерпан. Вы можете приобрести 1 подсказку за 20 монет.
                <br/><br/>
                Баланс: <span className="font-bold text-yellow-600 dark:text-yellow-500">{stats.coins} 🪙</span>
              </p>
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (stats.coins >= 20) {
                      setStats(prev => ({ ...prev, coins: prev.coins - 20, hintsCount: prev.hintsCount + 1 }));
                      setShowBuyHintModal(false);
                    }
                  }}
                  disabled={stats.coins < 20}
                  className={\`w-full py-3.5 rounded-2xl font-bold transition-all text-sm sm:text-base flex justify-center items-center gap-2 \${stats.coins >= 20 ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md' : 'bg-zinc-200 dark:bg-zinc-800/50 text-zinc-400 cursor-not-allowed'}\`}
                >
                  Купить за 20 🪙
                </button>
                <button
                  onClick={() => setShowBuyHintModal(false)}
                  className="w-full py-3.5 rounded-2xl font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-sm sm:text-base"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}`;

code = code.replace(
  /      \{\/\* Modals \*\/\}\n      <AnimatePresence>/,
  `      {/* Modals */}\n      <AnimatePresence>\n${buyHintModalUi}`
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for Buy Hint Modal');
