import https from 'https';

https.get('https://api.allorigins.win/raw?url=https://zamanilka.ru/oboi_hd/oboi-na-telefon-mashiny-top-150/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data.substring(0, 1000));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
