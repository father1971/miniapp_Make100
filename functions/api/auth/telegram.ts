export async function onRequestPost({ request, env }) {
  const TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_TEST_BOT_TOKEN = env.TELEGRAM_TEST_BOT_TOKEN;

  const BOT_TOKENS = [TELEGRAM_BOT_TOKEN, TELEGRAM_TEST_BOT_TOKEN].filter(Boolean);

  try {
    const { initData } = await request.json();

    if (!initData) {
      return new Response(JSON.stringify({ error: "initData is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    if (BOT_TOKENS.length === 0) {
      let user = null;
      try {
        const urlParams = new URLSearchParams(initData);
        const userStr = urlParams.get('user');
        if (userStr) {
          user = JSON.parse(userStr);
        }
      } catch (e) {
        console.error("Failed to parse user JSON from initData in telegram.ts Edge flow", e);
      }
      return new Response(JSON.stringify({ token: "mock_token", user, message: "Warning: Validation skipped due to missing TELEGRAM_BOT_TOKEN" }), { headers: { "Content-Type": "application/json" } });
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const dataCheckArr = [];
    for (const [key, value] of urlParams.entries()) {
      dataCheckArr.push(`${key}=${value}`);
    }
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    let isValid = false;

    // Web Crypto API HMAC implementation
    const encoder = new TextEncoder();
    const message = encoder.encode(dataCheckString);

    for (const token of BOT_TOKENS) {
      const secretKeyParams = await crypto.subtle.importKey(
        "raw",
        encoder.encode("WebAppData"),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const secretKeyBuffer = await crypto.subtle.sign("HMAC", secretKeyParams, encoder.encode(token));
      
      const keyParams = await crypto.subtle.importKey(
        "raw",
        secretKeyBuffer,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signatureBuffer = await crypto.subtle.sign("HMAC", keyParams, message);
      const hashArray = Array.from(new Uint8Array(signatureBuffer));
      const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (calculatedHash === hash) {
        isValid = true;
        break;
      }
    }

    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    const ONE_DAY = 24 * 60 * 60;

    if (Math.abs(now - authDate) > ONE_DAY) {
      return new Response(JSON.stringify({ error: "Session expired", code: "SESSION_EXPIRED" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const userStr = urlParams.get('user');
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) {}
    }

    return new Response(JSON.stringify({ token: "validated", user }), { headers: { "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error during validation" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
