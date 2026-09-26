import React from 'react';
import { motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { TranslationData } from '../translations';
import { HINT_COST_COINS } from '../constants';

interface BuyHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuy: () => Promise<void>;
  coins: number;
  isSubmitting: boolean;
  t: TranslationData;
}

export const BuyHintModal: React.FC<BuyHintModalProps> = React.memo(({
  isOpen,
  onClose,
  onBuy,
  coins,
  isSubmitting,
  t,
}) => {
  if (!isOpen) return null;

  const canAfford = coins >= HINT_COST_COINS;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[300] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-zinc-100 dark:border-zinc-800 relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
          <Lightbulb size={32} />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-center mb-2">
          {t?.outOfHints || 'Подсказки закончились'}
        </h2>
        <p className="text-center text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
          {t?.outOfHintsDesc || 'Ваш лимит подсказок исчерпан. Вы можете приобрести 1 подсказку за 20 монет.'}
          <br /><br />
          {t?.balance || 'Баланс:'} <span className="font-bold text-yellow-600 dark:text-yellow-500">{coins} 🪙</span>
        </p>
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={onBuy}
            disabled={isSubmitting || !canAfford}
            className={`w-full py-3.5 rounded-2xl font-bold transition-all text-sm sm:text-base flex justify-center items-center gap-2 ${
              !isSubmitting && canAfford
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
                : 'bg-zinc-200 dark:bg-zinc-800/50 text-zinc-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting
              ? (t?.loading || 'Загрузка...')
              : (t?.buyForCoins ? t.buyForCoins.replace('{cost}', String(HINT_COST_COINS)) : `Купить за ${HINT_COST_COINS} 🪙`)}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-sm sm:text-base"
          >
            {t?.cancel || 'Отмена'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});
