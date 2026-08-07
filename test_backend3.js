const API_URL = 'https://make100-backend.rotanovav.workers.dev';
async function test() {
  const res = await fetch(`${API_URL}/api/leaderboard`);
  const data = await res.json();
  console.log(JSON.stringify(data.find(d => d.username === 'RotanovAV'), null, 2));
}
test();
