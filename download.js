import fs from 'fs';
import path from 'path';

const dir = './src/assets/cars';

async function download() {
  // Try pexels or another source
  const altUrl = "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800"; 
  try {
    const res = await fetch(altUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(path.join(dir, `2.jpg`), Buffer.from(buffer));
    console.log(`Downloaded 2.jpg`);
  } catch (err) {
    console.error(`Failed to download 2.jpg:`, err);
  }
}

download();
