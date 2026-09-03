const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetBlock = `      setLastRoundTimeMs(exactSolveTimeMs);
      const currentInput = gaps.join('');
      lastRoundExpressionRef.current = currentInput;
      lastRoundSolveTimeMsRef.current = exactSolveTimeMs;

      // Validate on server
      submitGameSolve({
        formula: currentInput,`;

const newBlock = `      setLastRoundTimeMs(exactSolveTimeMs);
      const currentInput = gaps.join('');
      
      let fullExpression = "";
      for (let i = 0; i < digits.length; i++) {
        fullExpression += digits[i];
        if (i < gaps.length && gaps[i]) {
          fullExpression += gaps[i];
        }
      }
      
      lastRoundExpressionRef.current = fullExpression;
      lastRoundSolveTimeMsRef.current = exactSolveTimeMs;

      // Validate on server
      submitGameSolve({
        formula: fullExpression,`;

content = content.replace(targetBlock, newBlock);
fs.writeFileSync('src/App.tsx', content, 'utf8');
