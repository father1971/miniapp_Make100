import express from "express";
const app = express();
app.get('*all', (req, res) => res.send('matched *all'));
app.get('/something', (req, res) => res.send('matched something'));
app.listen(3001, () => {
  fetch('http://localhost:3001/').then(r => r.text()).then(t => console.log('/ ->', t)).catch(console.error);
  fetch('http://localhost:3001/foo').then(r => r.text()).then(t => console.log('/foo ->', t)).catch(console.error);
  setTimeout(() => process.exit(0), 1000);
});
