import React from 'react';
import { RefreshCw } from 'lucide-react';
import { TranslationData } from '../translations';

interface TelegramLoadingOverlayProps {
  t: TranslationData;
}

export const TelegramLoadingOverlay: React.FC<TelegramLoadingOverlayProps> = React.memo(({ t }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center max-w-xs text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center mb-4">
          <RefreshCw size={28} className="animate-spin text-orange-500" />
        </div>
        <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">Make 100</h2>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {t?.authorizingTg || 'Авторизация в Telegram...'}
        </p>
      </div>
    </div>
  );
});
