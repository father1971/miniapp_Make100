const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldShowHint = `  const showHint = async () => {
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

if (code.includes(oldShowHint)) {
  code = code.replace(oldShowHint, newShowHint);
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx hint patched');
} else {
  console.error("String not found! Retrying with regex...");
  code = code.replace(
    /  const showHint = async \(\) => \{\n    if \(isHinting \|\| won\) return;\n    const solution = findSolution\(digits\);\n    if \(\!solution\) \{\n      setNoSolutionMessage\(true\);\n      return;\n    \}\n\n    setIsHinting\(true\);\n    setHintUsed\(true\);/g,
    newShowHint
  );
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx hint patched via regex');
}
