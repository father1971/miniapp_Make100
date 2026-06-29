const fetch = require('node-fetch');
fetch('http://localhost:3000/').then(r => r.text()).then(t => console.log('Response length:', t.length, 'Content preview:', t.slice(0, 50))).catch(console.error);
