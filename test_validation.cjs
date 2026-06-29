const crypto = require('crypto');

const initData = "query_id=AAF_g34bAAAAAH-DfiN4Z1sX&user=%7B%22id%22%3A460833663%2C%22first_name%22%3A%22Ivan%22%2C%22last_name%22%3A%22Ivanov%22%2C%22username%22%3A%22ivan%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1719230000&hash=d2c...dummy";

const urlParams = new URLSearchParams(initData);
const hash = urlParams.get('hash');
urlParams.delete('hash');

const dataCheckArr = [];
for (const [key, value] of urlParams.entries()) {
  dataCheckArr.push(`${key}=${value}`);
}
dataCheckArr.sort((a, b) => a.localeCompare(b));
const dataCheckString = dataCheckArr.join('\n');
console.log("dataCheckString with URLSearchParams:\n" + dataCheckString);

const parts = initData.split('&');
const dataCheckArr2 = [];
for (const part of parts) {
  if (part.startsWith('hash=')) continue;
  const eqIdx = part.indexOf('=');
  const k = part.substring(0, eqIdx);
  const v = part.substring(eqIdx + 1);
  dataCheckArr2.push(`${k}=${decodeURIComponent(v)}`);
}
dataCheckArr2.sort();
const dataCheckString2 = dataCheckArr2.join('\n');
console.log("\ndataCheckString2 manual decode:\n" + dataCheckString2);

console.log("\nEqual? " + (dataCheckString === dataCheckString2));
