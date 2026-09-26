import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { TranslationData } from '../translations';
import { STORAGE_KEYS } from '../constants';

interface SaveBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: TranslationData;
  playSound?: (type: 'click' | 'success' | 'error' | 'skip') => void;
  playVibration?: (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => void;
}

export const SaveBotModal: React.FC<SaveBotModalProps> = React.memo(({
  isOpen,
  onClose,
  t,
  playSound,
  playVibration,
}) => {
  if (!isOpen) return null;

  const handleDismiss = () => {
    playVibration?.('light');
    playSound?.('click');
    onClose();
    try {
      localStorage.setItem(STORAGE_KEYS.SAVE_BOT_DISMISSED, 'true');
    } catch (e) {
      console.warn('Failed to save dismissal status:', e);
    }
  };

  const handleLaunchBot = () => {
    playVibration?.('success');
    playSound?.('success');
    onClose();
    try {
      localStorage.setItem(STORAGE_KEYS.SAVE_BOT_DISMISSED, 'true');
    } catch (e) {
      console.warn('Failed to save dismissal status:', e);
    }

    const botName = (import.meta.env.VITE_NAME_BOT || 'Test_Make100_bot').replace(/\s+/g, '');
    const botUrl = `https://t.me/${botName}?start=save_game`;
    const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : undefined;
    if (tg && typeof tg.openTelegramLink === 'function') {
      try {
        tg.openTelegramLink(botUrl);
      } catch (e) {
        window.open(botUrl, '_blank');
      }
    } else {
      window.open(botUrl, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-zinc-900/50 dark:bg-black/70 backdrop-blur-md flex items-center justify-center z-[310] p-4"
      onClick={handleDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl text-zinc-900 dark:text-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-white/40 dark:border-zinc-700/40 relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1 rounded-full cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30 animate-bounce">
          <Sparkles size={32} />
        </div>

        <h2 className="text-xl font-black text-center mb-2 leading-snug">
          {t?.saveBotModalTitle || 'Не потеряй игру Make 100! 🧩'}
        </h2>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-300 mb-6 leading-relaxed whitespace-pre-line">
          {t?.saveBotModalDesc ||
            'Закрепи бота в списке своих чатов, чтобы возвращаться к игре в любое время и сохранить свои рекорды и монеты.\n\nЗапусти бота прямо сейчас и получи бонус +250 🪙 монет!'}
        </p>

        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={handleLaunchBot}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white rounded-2xl font-black transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            {t?.saveBotModalBtn || '🤖 Запустить бота (+250 🪙)'}
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2.5 rounded-xl font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-sm cursor-pointer"
          >
            {t?.saveBotModalLater || 'Позже'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});
