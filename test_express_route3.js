import express from 'express';
const app = express();
app.get('*all', (req, res) => res.send('matched *all'));
app.listen(3002, () => {
    fetch('http://localhost:3002/foo/bar').then(r => r.text()).then(console.log);
    setTimeout(() => process.exit(0), 1000);
});
