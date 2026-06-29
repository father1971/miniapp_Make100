const crypto = require('crypto');

function validateInitData(initData, token) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  const dataCheckArr = [];
  for (const [key, value] of urlParams.entries()) {
    dataCheckArr.push(`${key}=${value}`);
  }
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join('\n');

  console.log("Data check string:\n" + dataCheckString);

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  console.log("Expected hash: " + calculatedHash);
  console.log("Actual hash:   " + hash);
  return calculatedHash === hash;
}

const mockInitData = "query_id=AAEq...&user=%7B%22id%22%3A123%2C%22first_name%22%3A%22Test%22%2C%22last_name%22%3A%22Test%22%2C%22username%22%3A%22test%22%2C%22language_code%22%3A%22en%22%7D&auth_date=1630000000&hash=mockhash";
// Just to check if it parses correctly
validateInitData(mockInitData, "test_token");
