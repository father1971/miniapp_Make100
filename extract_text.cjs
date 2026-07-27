const fs = require('fs');

const code = fs.readFileSync('src/App.tsx', 'utf8');

const matches = code.match(/>([^<{}]+)</g);

if (matches) {
  const texts = new Set();
  for (const match of matches) {
    const text = match.substring(1, match.length - 1).trim();
    if (text && text.length > 1 && /[A-Za-zА-Яа-я]/.test(text)) {
      texts.add(text);
    }
  }
  console.log(Array.from(texts).join('\n'));
}
