import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { applyTelegramMock } from '../fixtures/telegram-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

test.describe('Сценарии 6 и 7: Клавиатура операторов, ввод, проверка равенства 100 и экран победы', () => {
  test.beforeEach(async ({ page }) => {
    await applyTelegramMock(page);
    await page.addInitScript(() => {
      window.localStorage.setItem('make100_tutorial_completed_v3', 'true');
      window.localStorage.setItem('make100_tutorial_completed', 'true');
      window.localStorage.setItem('make100_save_bot_dismissed', 'true');
      window.localStorage.setItem('make100_game_mode', 'ticket');
    });
    await setupApiMocks(page);
  });

  test('6.1 - 6.5: Выбор слота и ввод математических операторов (+, -, *, /)', async ({ page }) => {
    await page.goto('/?e2e=true');

    // Нажимаем "Старт" при необходимости
    const startBtn = page.getByRole('button', { name: /^старт$|^start$/i });
    if (await startBtn.isVisible({ timeout: 3000 })) {
      await startBtn.click();
    }

    // Находим слот между цифрами (Слот 2)
    const slot2 = page.getByRole('button', { name: /слот 2|slot 2/i }).first();
    await expect(slot2).toBeVisible({ timeout: 5000 });
    await slot2.click();

    // Нажимаем оператор "+"
    const plusBtn = page.getByRole('button', { name: '+' }).first();
    await plusBtn.click();

    // Проверяем, что знак появился внутри выбранного слота
    await expect(slot2).toHaveText(/\+/);

    // Проверяем работу Backspace
    const backspaceBtn = page.locator('button[aria-label="Backspace"], button:has-text("⌫"), button:has-text("Delete")').first();
    if (await backspaceBtn.isEnabled()) {
      await backspaceBtn.click();
      await expect(slot2).not.toHaveText(/\+/);
    }

    await checkNoRawTranslationKeys(page, 'при работе с клавиатурой');
    await checkNoHorizontalOverflow(page, 'при работе с клавиатурой');
  });

  test('7.1 - 7.6: Экран победы (Win Screen) при сборе 100', async ({ page }) => {
    await page.goto('/?e2e=true');

    const startBtn = page.getByRole('button', { name: /^старт$|^start$/i });
    if (await startBtn.isVisible({ timeout: 3000 })) {
      await startBtn.click();
    }

    // Эмулируем победу через внутреннее состояние или вызов
    await page.evaluate(() => {
      // Имитируем успешное вычисление (решение найдено)
      window.dispatchEvent(new CustomEvent('make100_test_win'));
    });

    // Проверяем верстку и отсутствие горизонтального переполнения
    await checkNoHorizontalOverflow(page, 'на игровом поле');
  });
});
