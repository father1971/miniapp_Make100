fetch('http://localhost:3000/assets/index-CYYhliyo.js').then(r => r.text()).then(t => {
  console.log('Response length:', t.length);
  process.exit(0);
}).catch(console.error);
