import express from 'express';
import path from 'path';

const app = express();
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));
app.get('*all', (req, res) => res.send('HTML file'));

app.listen(3002, () => {
    fetch('http://localhost:3002/assets/index-CYYhliyo.js')
        .then(r => r.text())
        .then(t => console.log('Length:', t.length, t.slice(0, 30)));
    setTimeout(() => process.exit(0), 1000);
});
