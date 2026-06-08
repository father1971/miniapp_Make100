import express from "express";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import path from "path";

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_TEST_BOT_TOKEN = process.env.TELEGRAM_TEST_BOT_TOKEN;

// Combine tokens into an array, filtering out any undefined ones
const BOT_TOKENS = [TELEGRAM_BOT_TOKEN, TELEGRAM_TEST_BOT_TOKEN].filter(Boolean) as string[];

async function startServer() {
  const app = express();
  
  app.use(express.json());

  // API routes
  app.post("/api/auth/telegram", (req, res) => {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: "initData is required" });
    }

    if (BOT_TOKENS.length === 0) {
      console.warn("No Telegram bot tokens are set. Skipping validation for development.");
      const token = jwt.sign({ mock: true }, JWT_SECRET, { expiresIn: '1h' });
      let user = null;
      try {
        const urlParams = new URLSearchParams(initData);
        const userStr = urlParams.get('user');
        if (userStr) {
          user = JSON.parse(userStr);
        }
      } catch (e) {
        console.error("Failed to parse user JSON from initData in server.ts development flow", e);
      }
      return res.json({ token, user, message: "Warning: Validation skipped due to missing TELEGRAM_BOT_TOKEN" });
    }

    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      urlParams.delete('hash');

      const dataCheckArr: string[] = [];
      for (const [key, value] of urlParams.entries()) {
        dataCheckArr.push(`${key}=${value}`);
      }
      dataCheckArr.sort();
      const dataCheckString = dataCheckArr.join('\n');

      let isValid = false;

      // Try hashing with each available bot token
      for (const token of BOT_TOKENS) {
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
        
        if (calculatedHash === hash) {
          isValid = true;
          break;
        }
      }

      if (!isValid) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
      const now = Math.floor(Date.now() / 1000);
      const ONE_DAY = 24 * 60 * 60;

      if (Math.abs(now - authDate) > ONE_DAY) {
        return res.status(401).json({ error: "Session expired (auth_date is too old)", code: "SESSION_EXPIRED" });
      }

      // Validation successful, extract user info
      const userStr = urlParams.get('user');
      let user = null;
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error("Failed to parse user JSON", e);
        }
      }

      // Generate JWT
      const token = jwt.sign(
        { 
          tgId: user?.id,
          username: user?.username,
          authDate
        }, 
        JWT_SECRET, 
        { expiresIn: '30m' } // Short-lived token as requested
      );

      res.json({ token, user });
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({ error: "Internal server error during validation" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
