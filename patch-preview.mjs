import fs from 'fs';

const filePath = './src/App.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// We want to remove the return when isPreviewEnv is true in loadStats and the save stats effect.
// Instead of checking isPreviewEnv, we check if getAuthToken() is truthy or if we have a valid tgUser

content = content.replace(
  `    if (isPreviewEnv) {
      setIsLoadingLeaderboard(true);
      setTimeout(() => {
        setLeaderboardData([
          { id: '1', displayName: 'Алексей Иванов', solvedCount: 142, totalOperatorsUsed: 432, unsolvedCount: 12, totalSolveTime: 2311 },
          { id: '2', displayName: 'Мария Петрова', solvedCount: 115, totalOperatorsUsed: 360, unsolvedCount: 8, totalSolveTime: 1894 }
        ]);
        setIsLoadingLeaderboard(false);
      }, 500);
      return;
    }`,
  `    if (!getAuthToken() && isPreviewEnv) {
      setIsLoadingLeaderboard(true);
      setTimeout(() => {
        setLeaderboardData([
          { id: '1', displayName: 'Алексей Иванов', solvedCount: 142, totalOperatorsUsed: 432, unsolvedCount: 12, totalSolveTime: 2311 },
          { id: '2', displayName: 'Мария Петрова', solvedCount: 115, totalOperatorsUsed: 360, unsolvedCount: 8, totalSolveTime: 1894 }
        ]);
        setIsLoadingLeaderboard(false);
      }, 500);
      return;
    }`
);

content = content.replace(
  `      if (isPreviewEnv) {
        loadFromLocal();
        setStatsLoaded(true);
        return;
      }`,
  `      if (!getAuthToken() && isPreviewEnv) {
        loadFromLocal();
        setStatsLoaded(true);
        return;
      }`
);

content = content.replace(
  `    if (isPreviewEnv) {
      return;
    }`,
  `    if (!getAuthToken() && isPreviewEnv) {
      return;
    }`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Patched App.tsx for isPreviewEnv");
