const fs = require('fs');

const tsCode = fs.readFileSync('src/App.tsx', 'utf8');

const additions = {
  de: 'playAsGuest: "Als Gast spielen",',
  fr: 'playAsGuest: "Jouer en tant qu\'invité",',
  pt: 'playAsGuest: "Jogar como convidado",',
  es: 'playAsGuest: "Jugar como invitado",',
  zh: 'playAsGuest: "以访客身份游玩",',
  ja: 'playAsGuest: "ゲストとしてプレイ",',
  it: 'playAsGuest: "Gioca come ospite",',
  ko: 'playAsGuest: "게스트로 플레이",',
  tr: 'playAsGuest: "Misafir olarak oyna",',
  he: 'playAsGuest: "שחק כאורח",',
  ar: 'playAsGuest: "العب كضيف",',
  hi: 'playAsGuest: "अतिथि के रूप में खेलें",',
  la: 'playAsGuest: "Lude ut hospes",',
  eo: 'playAsGuest: "Ludi kiel gasto",',
  elvish: 'playAsGuest: "Tyala ve nér",',
  klingon: 'playAsGuest: "Quj qorDu\'",',
  dothraki: 'playAsGuest: "Lajat kisa",',
  valyrian: 'playAsGuest: "Tyvās jentys",'
};

let modifiedCode = tsCode;

for (const [lang, addition] of Object.entries(additions)) {
  const searchStr = `shareScore: `;
  
  // Find the language block
  const langRegex = new RegExp(`  ${lang}: {([\\s\\S]*?)(    tickets: {)`, 'm');
  const match = modifiedCode.match(langRegex);
  
  if (match) {
    const block = match[0];
    if (block.includes('playAsGuest')) continue;
    
    // We want to insert 'playAsGuest' right before 'tickets: {'
    // But maybe let's just replace 'shareScore: "...",\n    tickets' with 'shareScore: "...",\n    playAsGuest: "...",\n    tickets'
    
    const shareRegex = /(    shareScore: ".*",\n)(    tickets: {)/;
    const blockMatch = block.match(shareRegex);
    if (blockMatch) {
        const newBlock = block.replace(shareRegex, `$1    ${addition}\n$2`);
        modifiedCode = modifiedCode.replace(block, newBlock);
    } else {
        console.log("Could not find shareScore in lang", lang);
        // fallback: just insert before tickets
        const newBlock = block.replace('    tickets: {', `    ${addition}\n    tickets: {`);
        modifiedCode = modifiedCode.replace(block, newBlock);
    }
  } else {
    console.log("Could not find block for", lang);
  }
}

fs.writeFileSync('src/App.tsx', modifiedCode);
console.log("Patch complete.");
