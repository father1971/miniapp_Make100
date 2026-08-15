const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const botVar = "import.meta.env.VITE_NAME_BOT || 'Game_Make100_bot'";

code = code.replace(
  /tg\.openTelegramLink\("https:\/\/t\.me\/Game_Make100_bot"\);/,
  "tg.openTelegramLink(`https://t.me/${" + botVar + "}`);"
);

code = code.replace(
  /window\.open\("https:\/\/t\.me\/Game_Make100_bot", "_blank"\);/g,
  "window.open(`https://t.me/${" + botVar + "}`, \"_blank\");"
);

code = code.replace(
  /const botUsername = 'Test_Make100_bot';/,
  "const botUsername = " + botVar + ";"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched bot name references.");
