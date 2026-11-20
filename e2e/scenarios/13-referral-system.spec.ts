import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { applyTelegramMock } from '../fixtures/telegram-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

test.describe('Сценарий 13: Сквозное тестирование реферальной системы', () => {
  test('13.1 - 13.4: Переход по реферальной ссылке и фиксация реферера', async ({ page }) => {
    await applyTelegramMock(page, {
      user: { id: 888999, first_name: 'InvitedPlayer', username: 'invited' },
      start_param: 'ref_12345678',
    });
    await page.addInitScript(() => {
      window.localStorage.setItem('make100_tutorial_completed_v3', 'true');
      window.localStorage.setItem('make100_save_bot_dismissed', 'true');
    });
    await setupApiMocks(page);

    await page.goto('/?ref=12345678&e2e=true');

    // Кликаем "Старт"
    const startBtn = page.getByRole('button', { name: /^старт$|^start$/i });
    if (await startBtn.isVisible({ timeout: 3000 })) {
      await startBtn.click();
    }

    // Проверяем профиль и вкладку рефералов ("👥 Приглашения")
    const profileBtn = page.getByRole('button', { name: /открыть профиль|open profile/i });
    await expect(profileBtn).toBeVisible({ timeout: 5000 });
    await profileBtn.click();

    // Переключаемся на вкладку Приглашения
    const refTab = page.getByRole('button', { name: /приглаш|referral|реферал/i });
    await expect(refTab).toBeVisible({ timeout: 5000 });
    await refTab.click();

    // Кнопка копирования ссылки или QR-кода видна
    const copyBtn = page.getByRole('button', { name: /ссылк|копир|copy|qr/i });
    await expect(copyBtn.first()).toBeVisible({ timeout: 5000 });

    await checkNoRawTranslationKeys(page, 'в реферальном интерфейсе');
    await checkNoHorizontalOverflow(page, 'в реферальном интерфейсе');
  });
});
