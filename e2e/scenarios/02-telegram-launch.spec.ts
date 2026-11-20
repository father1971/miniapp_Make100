import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { applyTelegramMock } from '../fixtures/telegram-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

test.describe('Сценарий 2: Запуск внутри Telegram Mini App', () => {
  test('2.1 - 2.4: Автоматическая авторизация без показа WelcomeAuthModal', async ({ page }) => {
    // Внедряем надежный мок Telegram WebApp
    await applyTelegramMock(page, {
      user: {
        id: 777888999,
        first_name: 'Pavel',
        last_name: 'Durov',
        username: 'durov_test',
        language_code: 'ru',
      },
    });

    // Мокируем API
    await setupApiMocks(page, {
      userStats: {
        userId: 777888999,
        score: 350,
        coins: 200,
        hintsCount: 5,
        ticketsSolved: 12,
        carsSolved: 8,
      },
    });

    await page.goto('/?e2e=true');

    // 1. WelcomeAuthModal НЕ должен показываться внутри Telegram
    const welcomeModal = page.locator('[data-testid="welcome-auth-modal"]');
    await expect(welcomeModal).not.toBeVisible({ timeout: 5000 });

    // 2. Игровое поле загружено
    const gameArea = page.locator('.fixed.inset-0.w-full');
    await expect(gameArea.first()).toBeVisible({ timeout: 10000 });

    // 3. Проверяем вызовы HapticFeedback и ready()
    const isReadyCalled = await page.evaluate(() => {
      return (window as any).Telegram?.WebApp?.isExpanded === true;
    });
    expect(isReadyCalled).toBe(true);

    // 4. Проверка верстки
    await checkNoRawTranslationKeys(page, 'в Telegram Mini App');
    await checkNoHorizontalOverflow(page, 'в Telegram Mini App');
  });
});
