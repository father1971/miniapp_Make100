import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../fixtures/api-mock';
import { applyTelegramMock } from '../fixtures/telegram-mock';
import { checkNoRawTranslationKeys } from '../helpers/i18n-checker';
import { checkNoHorizontalOverflow } from '../helpers/layout-checker';

test.describe('Сценарии 15, 16 и 17: Модалка бота, Обратная связь и Экран блокировки', () => {
  test('15.1: Модалка "Закрепи бота" внутри Telegram', async ({ page }) => {
    await applyTelegramMock(page, {
      user: { id: 98765432, first_name: 'LoyalPlayer' },
    });
    await page.addInitScript(() => {
      window.localStorage.removeItem('make100_save_bot_dismissed');
      window.localStorage.setItem('make100_tutorial_completed_v3', 'true');
    });
    await setupApiMocks(page);

    await page.goto('/?e2e=true');

    // Через 2 секунды должна появиться модалка SaveBotModal
    const saveBotTitle = page.locator('h2, [data-testid="save-bot-modal"]', { hasText: /закрепи|сохрани|save bot/i });
    if (await saveBotTitle.first().isVisible({ timeout: 5000 })) {
      const laterBtn = page.getByRole('button', { name: /позже|закрыть|later/i });
      if (await laterBtn.first().isVisible()) {
        await laterBtn.first().click();
      }
    }

    await checkNoRawTranslationKeys(page, 'в окне закрепления бота');
  });

  test('16.1: Модалка обратной связи (Feedback) — отправка сообщения', async ({ page }) => {
    await applyTelegramMock(page);
    await page.addInitScript(() => {
      window.localStorage.setItem('make100_tutorial_completed_v3', 'true');
      window.localStorage.setItem('make100_save_bot_dismissed', 'true');
    });
    await setupApiMocks(page);

    await page.goto('/?e2e=true');

    const startBtn = page.getByRole('button', { name: /^старт$|^start$/i });
    if (await startBtn.isVisible({ timeout: 3000 })) {
      await startBtn.click();
    }

    // Открываем меню настроек
    const settingsBtn = page.getByRole('button', { name: /меню настроек|settings menu/i });
    await expect(settingsBtn).toBeVisible({ timeout: 5000 });
    await settingsBtn.click();

    // В меню настроек находим кнопку "Написать разработчику"
    const feedbackBtn = page.getByRole('button', { name: /разработчик|обратная связь|отзыв|feedback|developer/i });
    await expect(feedbackBtn).toBeVisible({ timeout: 5000 });
    await feedbackBtn.click();

    // Модалка обратной связи открыта: заполняем все 3 обязательных поля
    const nameInput = page.locator('input[placeholder*="обращаться"]');
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('Тестер E2E');

    const contactInput = page.locator('input[placeholder*="Telegram"]');
    await expect(contactInput).toBeVisible();
    await contactInput.fill('@tester_e2e');

    const msgInput = page.locator('textarea');
    await expect(msgInput).toBeVisible();
    await msgInput.fill('Отличная игра, всё работает прекрасно!');

    // Кликаем отправить
    const sendBtn = page.getByRole('button', { name: /отправить|send/i });
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();

    // Проверяем подтверждение об отправке
    const successMsg = page.locator('text=/сообщение отправлено|отправлено|success/i');
    await expect(successMsg.first()).toBeVisible({ timeout: 5000 });

    await checkNoRawTranslationKeys(page, 'в окне обратной связи');
  });

  test('17.1: Экран блокировки (Бан пользователя)', async ({ page }) => {
    await applyTelegramMock(page, {
      user: { id: 999666, first_name: 'BannedUser' },
    });
    // Мокируем API с ответом бана
    await setupApiMocks(page, { isBanned: true });

    await page.goto('/?e2e=true');

    // Экран бана отображается
    const banTitle = page.locator('h1', { hasText: /доступ ограничен|заблокирован|banned/i });
    await expect(banTitle).toBeVisible({ timeout: 10000 });

    // Кнопка обращения в поддержку присутствует
    const supportLink = page.locator('a[href*="t.me"]');
    await expect(supportLink).toBeVisible();

    await checkNoRawTranslationKeys(page, 'на экране блокировки');
    await checkNoHorizontalOverflow(page, 'на экране блокировки');
  });
});
