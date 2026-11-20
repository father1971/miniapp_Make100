import { Page, Route } from '@playwright/test';

/**
 * API Mocking helper for Make 100 backend endpoints
 */

export interface MockUserStats {
  userId?: number;
  score?: number;
  ticketsSolved?: number;
  carsSolved?: number;
  coins?: number;
  hintsCount?: number;
  referralsCount?: number;
  referredBy?: number;
  isBanned?: boolean;
  streakDays?: number;
  solvedHistory?: string[];
  [key: string]: any;
}

export interface SetupApiMockOptions {
  userStats?: MockUserStats;
  isBanned?: boolean;
  leaderboard?: any[];
  failAll?: boolean;
  failEndpoints?: string[];
  delayMs?: number;
}

export async function setupApiMocks(page: Page, options: SetupApiMockOptions = {}) {
  const stats: MockUserStats = {
    id: options.userStats?.userId || 12345678,
    userId: options.userStats?.userId || 12345678,
    score: 100,
    ticketsSolved: 5,
    carsSolved: 3,
    coins: 150,
    hintsCount: 3,
    referralsCount: 2,
    referredBy: undefined,
    isBanned: Boolean(options.isBanned),
    streakDays: 1,
    solvedHistory: ['123456', '789012'],
    ...options.userStats,
  };

  const leaderboard = options.leaderboard || [
    { rank: 1, username: 'TopPlayer', first_name: 'Alex', score: 1250, ticketsSolved: 80, carsSolved: 45 },
    { rank: 2, username: 'MathWizard', first_name: 'Elena', score: 980, ticketsSolved: 60, carsSolved: 38 },
    { rank: 3, username: 'test_player', first_name: 'TestUser', score: stats.score, ticketsSolved: stats.ticketsSolved, carsSolved: stats.carsSolved },
  ];

  await page.route('**/api/**', async (route: Route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();

    if (options.delayMs) {
      await new Promise(r => setTimeout(r, options.delayMs));
    }

    if (options.failAll || (options.failEndpoints && options.failEndpoints.some(e => url.includes(e)))) {
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Internal Server Error (Mocked)' }),
      });
    }

    // 1. /api/user
    if (url.includes('/api/user') && !url.includes('buy-hint') && !url.includes('use-hint')) {
      if (options.isBanned) {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'banned', isBanned: true, reason: 'Banned by admin' }),
        });
      }
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(stats),
        });
      }
      if (method === 'POST') {
        try {
          const body = JSON.parse(request.postData() || '{}');
          Object.assign(stats, body);
        } catch (e) {}
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, stats }),
        });
      }
    }

    // 2. /api/leaderboard
    if (url.includes('/api/leaderboard')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          leaderboard,
          myRank: 3,
          myScore: stats.score,
        }),
      });
    }

    // 3. /api/game/solve
    if (url.includes('/api/game/solve')) {
      stats.score = (stats.score || 0) + 10;
      stats.coins = (stats.coins || 0) + 10;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          score: stats.score,
          coins: stats.coins,
          ticketsSolved: (stats.ticketsSolved || 0) + 1,
        }),
      });
    }

    // 4. /api/game/skip
    if (url.includes('/api/game/skip')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    }

    // 5. /api/user/buy-hint
    if (url.includes('/api/user/buy-hint')) {
      if ((stats.coins || 0) >= 20) {
        stats.coins = (stats.coins || 0) - 20;
        stats.hintsCount = (stats.hintsCount || 0) + 1;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            hintsCount: stats.hintsCount,
            coins: stats.coins,
          }),
        });
      } else {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Insufficient coins',
          }),
        });
      }
    }

    // 6. /api/user/use-hint
    if (url.includes('/api/user/use-hint')) {
      if ((stats.hintsCount || 0) > 0) {
        stats.hintsCount = (stats.hintsCount || 0) - 1;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            hintsCount: stats.hintsCount,
            coins: stats.coins,
          }),
        });
      } else {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'No hints remaining',
          }),
        });
      }
    }

    // 7. /api/tickets/random
    if (url.includes('/api/tickets/random')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          ticket: '394812',
          image: null,
        }),
      });
    }

    // 8. /api/cars/pool
    if (url.includes('/api/cars/pool')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          count: 5,
          cars: [
            { id: 'car1', url: 'test_images/car1.jpg' },
            { id: 'car2', url: 'test_images/car2.jpg' },
          ],
        }),
      });
    }

    // 9. /api/tickets/pool
    if (url.includes('/api/tickets/pool')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          count: 5,
          tickets: [
            { id: 'ticket1', number: '123456' },
            { id: 'ticket2', number: '234567' },
          ],
        }),
      });
    }

    // 10. /api/contact/feedback
    if (url.includes('/api/contact/feedback')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Feedback received successfully',
        }),
      });
    }

    // 11. /api/auth/telegram-widget
    if (url.includes('/api/auth/telegram-widget')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          token: 'mock_jwt_token_widget_123',
          user: {
            id: 998877,
            first_name: 'WidgetUser',
            username: 'widget_fan',
          },
        }),
      });
    }

    // 12. /api/auth/email/send-code
    if (url.includes('/api/auth/email/send-code')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Code sent to email',
          otpSession: 'mock_otp_session_xyz123',
          devCode: '123456', // для тестирования
        }),
      });
    }

    // 13. /api/auth/email/verify-code
    if (url.includes('/api/auth/email/verify-code')) {
      let code = '';
      try {
        const body = JSON.parse(request.postData() || '{}');
        code = body.code;
      } catch (e) {}

      if (code === '123456') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            token: 'mock_jwt_token_email_user',
            user: {
              id: 555444,
              email: 'test@example.com',
              name: 'EmailPlayer',
            },
          }),
        });
      } else {
        return route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Invalid or expired code',
          }),
        });
      }
    }

    // 14. /api/referrals/visit
    if (url.includes('/api/referrals/visit')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    }

    // Fallback: continue request
    return route.continue();
  });

  return { stats, leaderboard };
}
