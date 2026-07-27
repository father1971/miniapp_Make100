const fs = require('fs');

const tsCode = fs.readFileSync('src/App.tsx', 'utf8');

// We need a simple parser for the TRANSLATIONS object.
// Since it's a JS object, let's try to extract and evaluate it.
const startIndex = tsCode.indexOf('const TRANSLATIONS = {');
let openBraces = 0;
let endIndex = -1;
for (let i = startIndex + 'const TRANSLATIONS = '.length; i < tsCode.length; i++) {
  if (tsCode[i] === '{') openBraces++;
  else if (tsCode[i] === '}') {
    openBraces--;
    if (openBraces === 0) {
      endIndex = i + 1;
      break;
    }
  }
}

const objStr = tsCode.substring(startIndex + 'const TRANSLATIONS = '.length, endIndex);
let TRANSLATIONS;
try {
  TRANSLATIONS = eval('(' + objStr + ')');
} catch (e) {
  console.log("Eval failed", e);
  process.exit(1);
}

const baseLang = 'ru';
const baseKeys = Object.keys(TRANSLATIONS[baseLang]);

for (const lang of Object.keys(TRANSLATIONS)) {
  if (lang === baseLang) continue;
  const langKeys = Object.keys(TRANSLATIONS[lang]);
  
  const missing = baseKeys.filter(k => !langKeys.includes(k));
  if (missing.length > 0) {
    console.log(`Language ${lang} is missing keys: ${missing.join(', ')}`);
  }
  
  const extra = langKeys.filter(k => !baseKeys.includes(k));
  if (extra.length > 0) {
    console.log(`Language ${lang} has extra keys: ${extra.join(', ')}`);
  }
  
  // Also check nested 'tickets'
  const baseTickets = Object.keys(TRANSLATIONS[baseLang].tickets);
  const langTickets = Object.keys(TRANSLATIONS[lang].tickets || {});
  
  const missingT = baseTickets.filter(k => !langTickets.includes(k));
  if (missingT.length > 0) {
    console.log(`Language ${lang} tickets missing keys: ${missingT.join(', ')}`);
  }
}
console.log("Check complete.");
