import fs from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

const urls = [
  'https://images.unsplash.com/photo-1503376712341-004823698ea0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'
];

async function downloadFile(url, fileName) {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(fileName, { flags: 'w' });
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
}

async function run() {
  for (let i = 0; i < urls.length; i++) {
    await downloadFile(urls[i], `src/assets/cars/${i + 1}.jpg`);
    console.log(`Downloaded ${i + 1}.jpg`);
  }
}
run();
