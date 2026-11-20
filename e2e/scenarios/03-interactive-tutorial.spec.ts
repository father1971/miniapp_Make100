import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { applyTelegramMock } from '../fixtures/telegram-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

test.describe('Сценарий 3: Интерактивный туториал (24 шага)', () => {
  test.beforeEach(async ({ page }) => {
    // В Telegram туториал запускается сразу при первом визите (если не пройден)
    await applyTelegramMock(page, {
      user: { id: 112233, first_name: 'Newbie', username: 'newbie' },
    });
    await page.addInitScript(() => {
      window.localStorage.removeItem('make100_tutorial_completed_v3');
      window.localStorage.removeItem('make100_tutorial_completed');
    });
    await setupApiMocks(page);
  });

  test('3.1 - 3.4: Полноценное отображение туториала и кнопка "Пропустить"', async ({ page }) => {
    await page.goto('/?e2e=true');

    // Проверяем наличие точной кнопки "Пропустить" в шапке туториала
    const skipBtn = page.getByRole('button', { name: /^пропустить$|^skip$/i });
    await expect(skipBtn.first()).toBeVisible({ timeout: 10000 });

    // Проверяем тексты и верстку первого шага
    await checkNoRawTranslationKeys(page, 'в интерактивном туториале');
    await checkNoHorizontalOverflow(page, 'в интерактивном туториале');
  });

  test('3.5: Клик "Пропустить" завершает туториал и сохраняет флаг в localStorage', async ({ page }) => {
    await page.goto('/?e2e=true');

    const skipBtn = page.getByRole('button', { name: /^пропустить$|^skip$/i }).first();
    await expect(skipBtn).toBeVisible({ timeout: 10000 });
    await skipBtn.click();

    // Туториал исчез
    await expect(skipBtn).not.toBeVisible({ timeout: 5000 });

    // Игровое поле доступно
    const gameArea = page.locator('.fixed.inset-0.w-full');
    await expect(gameArea.first()).toBeVisible();

    // Флаг сохранен
    const completed = await page.evaluate(() => localStorage.getItem('make100_tutorial_completed_v3') || localStorage.getItem('make100_tutorial_completed'));
    expect(completed).toBe('true');
  });

  test('3.6: Прохождение начальных шагов туториала кликом "Далее"', async ({ page }) => {
    await page.goto('/?e2e=true');

    // На шаге 0 есть кнопка "Далее" / "Понятно"
    const nextBtn = page.getByRole('button', { name: /далее|понятно|вперед|next|start/i }).first();
    if (await nextBtn.isVisible({ timeout: 4000 })) {
      await nextBtn.click();
    }

    // Проверяем отсутствие сырых переводов на следующем шаге
    await checkNoRawTranslationKeys(page, 'на шаге 1 туториала');
  });
});
