const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const uiHtml = `                {playerRank !== null && (
                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded text-xs font-bold">
                    <Trophy size={10} />
                    <span>#{playerRank}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-bold shadow-sm border border-yellow-200 dark:border-yellow-800/50 ml-1" title="Баланс монет">
                  <span>🪙 {stats.coins}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold shadow-sm border border-blue-200 dark:border-blue-800/50" title="Количество подсказок">
                  <span>💡 {stats.hintsCount}</span>
                </div>`;

code = code.replace(
  /                \{playerRank !== null && \(\n                  <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900\/30 text-amber-600 dark:text-amber-400 px-1\.5 py-0\.5 rounded text-xs font-bold">\n                    <Trophy size=\{10\} \/>\n                    <span>#\{playerRank\}<\/span>\n                  <\/div>\n                \)\}/,
  uiHtml
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx UI patched');
