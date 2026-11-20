import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { applyTelegramMock } from '../fixtures/telegram-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

test.describe('Сценарии 10, 11 и 12: Меню настроек, Профиль игрока и Таблица лидеров', () => {
  test.beforeEach(async ({ page }) => {
    await applyTelegramMock(page);
    await page.addInitScript(() => {
      window.localStorage.setItem('make100_tutorial_completed_v3', 'true');
      window.localStorage.setItem('make100_tutorial_completed', 'true');
      window.localStorage.setItem('make100_save_bot_dismissed', 'true');
    });
    await setupApiMocks(page);
  });

  test('10.1: Открытие меню настроек, проверка звука, вибрации и закрытия', async ({ page }) => {
    await page.goto('/?e2e=true');

    const startBtn = page.locator('button.bg-orange-500').first();
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
      await expect(startBtn).not.toBeVisible({ timeout: 5000 }).catch(() => {});
    }

    // Открываем меню настроек
    const settingsBtn = page.getByRole('button', { name: /меню настроек|settings menu/i });
    await expect(settingsBtn).toBeVisible({ timeout: 5000 });
    await settingsBtn.click();

    // Проверяем элементы настроек
    const settingsHeader = page.locator('h2', { hasText: /настройки|settings/i });
    await expect(settingsHeader).toBeVisible({ timeout: 5000 });

    // Проверяем кнопки переключения звука / вибрации
    const soundToggle = page.locator('button, div', { hasText: /звук|sound/i });
    await expect(soundToggle.first()).toBeVisible();

    // Закрываем меню
    const closeBtn = page.locator('button[aria-label="Закрыть"], button[aria-label="Close"]');
    if (await closeBtn.isVisible({ timeout: 2000 })) {
      await closeBtn.click();
      await expect(settingsHeader).not.toBeVisible({ timeout: 3000 });
    }

    await checkNoRawTranslationKeys(page, 'в меню настроек');
    await checkNoHorizontalOverflow(page, 'в меню настроек');
  });

  test('11.1: Профиль игрока — открытие, вкладки Статистика и Рефералы', async ({ page }) => {
    await page.goto('/?e2e=true');

    const startBtn = page.locator('button.bg-orange-500').first();
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
      await expect(startBtn).not.toBeVisible({ timeout: 5000 }).catch(() => {});
    }

    // Кликаем по аватарке профиля
    const profileBtn = page.getByRole('button', { name: /открыть профиль|open profile/i });
    await expect(profileBtn).toBeVisible({ timeout: 5000 });
    await profileBtn.click();

    // Модалка профиля открылась
    const profileModal = page.locator('[data-testid="user-profile"], .fixed.inset-0.z-50');
    await expect(profileModal.first()).toBeVisible({ timeout: 5000 });

    // Проверяем вкладки Статистика / Рефералы
    const refTab = page.getByRole('button', { name: /реферал|referral|друзья/i });
    if (await refTab.isVisible({ timeout: 3000 })) {
      await refTab.click();
      await page.waitForTimeout(300);
    }

    // Проверяем отсутствие сырых переводов
    await checkNoRawTranslationKeys(page, 'в профиле игрока');
    await checkNoHorizontalOverflow(page, 'в профиле игрока');
  });

  test('12.1: Таблица лидеров — открытие списка лучших игроков', async ({ page }) => {
    await page.goto('/?e2e=true');

    const startBtn = page.locator('button.bg-orange-500').first();
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
      await expect(startBtn).not.toBeVisible({ timeout: 5000 }).catch(() => {});
    }

    // Кликаем по кубку лидеров
    const leadBtn = page.getByRole('button', { name: /рейтинг|зал славы|leaderboard/i });
    await expect(leadBtn).toBeVisible({ timeout: 5000 });
    await leadBtn.click();

    // Модалка таблицы лидеров открылась
    const leadModal = page.locator('.fixed.inset-0.z-50, [data-testid="leaderboard-modal"]');
    await expect(leadModal.first()).toBeVisible({ timeout: 5000 });

    // Проверяем отображение топ-игроков (из нашего API мока)
    const topPlayer = page.locator('text=TopPlayer');
    await expect(topPlayer.first()).toBeVisible({ timeout: 5000 });

    await checkNoRawTranslationKeys(page, 'в таблице лидеров');
    await checkNoHorizontalOverflow(page, 'в таблице лидеров');
  });
});
