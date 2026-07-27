const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const match = content.match(/const TRANSLATIONS = ({[\s\S]*?^  },\n  [a-z]{2}: {)/m);
// Actually, extracting this with regex might be tricky. Let's just find the keys of the RU dictionary and then check if other languages have them.
