import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import path from "path";
import { db } from "./src/db";
import { users } from "./src/db/schema";
import { eq, desc, sql } from "drizzle-orm";

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_TEST_BOT_TOKEN = process.env.TELEGRAM_TEST_BOT_TOKEN;

// Combine tokens into an array, filtering out any undefined ones
const BOT_TOKENS = [TELEGRAM_BOT_TOKEN, TELEGRAM_TEST_BOT_TOKEN].filter(Boolean) as string[];

// Middleware to authenticate JWT
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
}

async function startServer() {
  const app = express();
  
  app.use(express.json());

  // Initialize DB table
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT,
        username TEXT,
        avatar_url TEXT,
        solved_count INTEGER NOT NULL DEFAULT 0,
        skipped_count INTEGER NOT NULL DEFAULT 0,
        best_time_ms INTEGER,
        min_characters INTEGER,
        total_time_ms INTEGER NOT NULL DEFAULT 0,
        total_characters INTEGER NOT NULL DEFAULT 0,
        settings TEXT NOT NULL DEFAULT '{}',
        last_saved_at INTEGER NOT NULL
      )
    `);
    console.log("Database initialized");
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }

  // API routes
  app.post("/api/auth/telegram", (req, res) => {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: "initData is required" });
    }

    if (BOT_TOKENS.length === 0) {
      console.warn("No Telegram bot tokens are set. Skipping validation for development.");
      let user = null;
      let tgId = Math.floor(Math.random() * 1000000); // mock id
      try {
        const urlParams = new URLSearchParams(initData);
        const userStr = urlParams.get('user');
        if (userStr) {
          user = JSON.parse(userStr);
          if (user.id) tgId = user.id;
        }
      } catch (e) {
        console.error("Failed to parse user JSON from initData in server.ts development flow", e);
      }
      const token = jwt.sign({ tgId, mock: true }, JWT_SECRET, { expiresIn: '1h' });
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
      const THIRTY_DAYS = 30 * 24 * 60 * 60;

      if (Math.abs(now - authDate) > THIRTY_DAYS) {
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
        { expiresIn: '12h' }
      );

      res.json({ token, user });
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({ error: "Internal server error during validation" });
    }
  });

  // Get current user stats
  app.get('/api/user', authenticateToken, async (req, res) => {
    try {
      const { tgId } = (req as any).user;
      if (!tgId) return res.status(400).json({ error: "No user ID" });
      
      const userRecords = await db.select().from(users).where(eq(users.id, tgId));
      if (userRecords.length > 0) {
        res.json(userRecords[0]);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (e) {
      console.error("Error fetching user", e);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Create or update user stats
  app.post('/api/user', authenticateToken, async (req, res) => {
    try {
      const { tgId } = (req as any).user;
      if (!tgId) return res.status(400).json({ error: "No user ID" });
      
      const { 
        firstName, lastName, username, avatarUrl, 
        solvedCount, skippedCount, bestTimeMs, minCharacters, 
        totalTimeMs, totalCharacters, settings 
      } = req.body;

      // Upsert user
      const existingUser = await db.select().from(users).where(eq(users.id, tgId));
      
      if (existingUser.length > 0) {
        await db.update(users).set({
          firstName: firstName || existingUser[0].firstName,
          lastName: lastName !== undefined ? lastName : existingUser[0].lastName,
          username: username !== undefined ? username : existingUser[0].username,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : existingUser[0].avatarUrl,
          solvedCount: solvedCount !== undefined ? solvedCount : existingUser[0].solvedCount,
          skippedCount: skippedCount !== undefined ? skippedCount : existingUser[0].skippedCount,
          bestTimeMs: bestTimeMs !== undefined ? bestTimeMs : existingUser[0].bestTimeMs,
          minCharacters: minCharacters !== undefined ? minCharacters : existingUser[0].minCharacters,
          totalTimeMs: totalTimeMs !== undefined ? totalTimeMs : existingUser[0].totalTimeMs,
          totalCharacters: totalCharacters !== undefined ? totalCharacters : existingUser[0].totalCharacters,
          settings: settings ? JSON.stringify(settings) : existingUser[0].settings,
          lastSavedAt: new Date(),
        }).where(eq(users.id, tgId));
      } else {
        await db.insert(users).values({
          id: tgId,
          firstName: firstName || 'Guest',
          lastName: lastName || null,
          username: username || null,
          avatarUrl: avatarUrl || null,
          solvedCount: solvedCount || 0,
          skippedCount: skippedCount || 0,
          bestTimeMs: bestTimeMs || null,
          minCharacters: minCharacters || null,
          totalTimeMs: totalTimeMs || 0,
          totalCharacters: totalCharacters || 0,
          settings: settings ? JSON.stringify(settings) : '{}',
          lastSavedAt: new Date(),
        });
      }
      
      res.json({ success: true });
    } catch (e) {
      console.error("Error updating user", e);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Get leaderboard
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const topPlayers = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
        avatarUrl: users.avatarUrl,
        solvedCount: users.solvedCount
      })
      .from(users)
      .orderBy(desc(users.solvedCount))
      .limit(50);
      
      res.json(topPlayers);
    } catch (e) {
      console.error("Error fetching leaderboard", e);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
