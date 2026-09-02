const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const updateStatsStr = `
        if (res.solvedCount !== undefined) setSolvedCount(res.solvedCount);
        if (res.skippedCount !== undefined) setUnsolvedCount(res.skippedCount);
        if (res.totalTimeMs !== undefined) setTotalSolveTime(res.totalTimeMs);
        if (res.totalCharacters !== undefined) setTotalOperatorsUsed(res.totalCharacters);
`;

// in handleSkip
content = content.replace(
  'modeStats: res.modeStats !== undefined ? res.modeStats : prev.modeStats\n          };\n        });\n      }',
  'modeStats: res.modeStats !== undefined ? res.modeStats : prev.modeStats\n          };\n        });\n' + updateStatsStr + '      }'
);

// in isWin
content = content.replace(
  'modeStats: res.modeStats !== undefined ? res.modeStats : prev.modeStats\n            };\n          });\n          \n          if (res.isNewGlobalRecord) {',
  'modeStats: res.modeStats !== undefined ? res.modeStats : prev.modeStats\n            };\n          });\n' + updateStatsStr + '\n          if (res.isNewGlobalRecord) {'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
