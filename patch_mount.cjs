const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /  useEffect\(\(\) => \{\n    initGame\(true\);\n  \}, \[initGame\]\);/,
  `  useEffect(() => {\n    initGame(true);\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, []);`
);

fs.writeFileSync('src/App.tsx', code);
