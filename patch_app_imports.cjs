const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("import { fetchUserStats, saveUserStats, fetchLeaderboard as fetchLeaderboardApi } from './api';",
"import { fetchUserStats, saveUserStats, fetchLeaderboard as fetchLeaderboardApi, API_URL, getAuthHeader } from './api';");
fs.writeFileSync('src/App.tsx', code);
