const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldShowHintStart = `  const showHint = async () => {
    if (isHinting || won) return;

    const solution = findSolution(digits);
    if (!solution) {
      setNoSolutionMessage(true);
      return;
    }

    setIsHinting(true);
    setHintUsed(true);`;

const newShowHint = `  const showHint = () => {
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
  };

  const showHintOnScreen = async () => {
    const solution = findSolution(digits);
    if (!solution) {
      setNoSolutionMessage(true);
      return;
    }

    setIsHinting(true);
    setHintUsed(true);`;

code = code.replace(oldShowHintStart, newShowHint);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx hint patched');
