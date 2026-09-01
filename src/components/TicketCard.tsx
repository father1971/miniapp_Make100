import React from 'react';

export interface TicketCardProps {
  digits: string[];
  category?: string;
  categoryName?: string;
}

type ThemeDef = {
  bg: string;
  border: string;
  textMain: string;
  textAccent: string;
  digits: string;
  badge: string;
  fallbackTitle: string;
  perforation: string;
  extraBg?: string;
};

const THEMES: Record<string, ThemeDef> = {
  theatre: {
    bg: 'bg-gradient-to-br from-rose-950 via-red-900 to-rose-950',
    border: 'border-yellow-600/50',
    textMain: 'text-yellow-500',
    textAccent: 'text-yellow-400',
    digits: 'text-yellow-400 mix-blend-plus-lighter drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]',
    badge: 'ПАРТЕР • ЛОЖА №5',
    fallbackTitle: 'ТЕАТРАЛЬНЫЙ БИЛЕТ',
    perforation: 'border-yellow-600/40',
  },
  bus: {
    bg: 'bg-[#e6ddc5] dark:bg-[#c2b699]',
    border: 'border-amber-900/20',
    textMain: 'text-stone-800',
    textAccent: 'text-stone-600',
    digits: 'text-red-700 mix-blend-multiply opacity-90',
    badge: 'ТАЛОН • 6 КОП.',
    fallbackTitle: 'БИЛЕТ НА АВТОБУС',
    perforation: 'border-stone-500/50',
  },
  flight: {
    bg: 'bg-white dark:bg-zinc-100',
    border: 'border-blue-900/20',
    textMain: 'text-blue-950',
    textAccent: 'text-blue-800',
    digits: 'text-slate-900',
    badge: 'SVO ✈ DXB • GATE B22',
    fallbackTitle: 'BOARDING PASS',
    perforation: 'border-blue-200',
  },
  train: {
    bg: 'bg-teal-50 dark:bg-teal-950',
    border: 'border-teal-700/30',
    textMain: 'text-teal-900 dark:text-teal-100',
    textAccent: 'text-emerald-800 dark:text-emerald-300',
    digits: 'text-teal-800 dark:text-teal-300 mix-blend-multiply dark:mix-blend-screen',
    badge: 'СКОРЫЙ ПОЕЗД • ВАГОН 07',
    fallbackTitle: 'Ж/Д БИЛЕТ',
    perforation: 'border-teal-600/40',
    extraBg: 'bg-[radial-gradient(circle_at_center,transparent_40%,rgba(13,148,136,0.05)_41%,transparent_42%)] bg-[length:20px_20px]',
  },
  concert: {
    bg: 'bg-zinc-950',
    border: 'border-violet-500/30',
    textMain: 'text-violet-300',
    textAccent: 'text-fuchsia-400',
    digits: 'text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]',
    badge: 'FAN ZONE • ALL ACCESS VIP',
    fallbackTitle: 'CONCERT PASS',
    perforation: 'border-violet-700/50',
    extraBg: 'bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.2),transparent_50%)]',
  },
  stadium: {
    bg: 'bg-green-700 dark:bg-green-800',
    border: 'border-green-400/30',
    textMain: 'text-white',
    textAccent: 'text-green-200',
    digits: 'text-yellow-300 drop-shadow-md',
    badge: 'SECTOR C • MATCH DAY',
    fallbackTitle: 'STADIUM TICKET',
    perforation: 'border-white/40',
  },
  cinema: {
    bg: 'bg-amber-600 dark:bg-amber-700',
    border: 'border-amber-900/50',
    textMain: 'text-amber-100',
    textAccent: 'text-amber-50',
    digits: 'text-amber-950 drop-shadow-sm mix-blend-multiply opacity-80',
    badge: 'ADMIT ONE • ЗАЛ 1',
    fallbackTitle: 'БИЛЕТ В КИНО',
    perforation: 'border-amber-900/40',
  },
  amusement: {
    bg: 'bg-white dark:bg-zinc-100',
    border: 'border-red-500',
    textMain: 'text-red-700',
    textAccent: 'text-red-600',
    digits: 'text-red-600 drop-shadow-md',
    badge: '★ ★ ★ ADMIT ONE ★ ★ ★',
    fallbackTitle: 'AMUSEMENT PARK',
    perforation: 'border-red-500/40',
    extraBg: 'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.1)_10px,rgba(239,68,68,0.1)_20px)]',
  },
  museum: {
    bg: 'bg-white dark:bg-zinc-950',
    border: 'border-black dark:border-white border-2',
    textMain: 'text-black dark:text-white',
    textAccent: 'text-gray-500 dark:text-gray-400',
    digits: 'text-black dark:text-white font-light tracking-[0.25em]',
    badge: 'EXHIBITION PASS',
    fallbackTitle: 'MUSEUM ADMISSION',
    perforation: 'border-black dark:border-white',
  },
  lottery: {
    bg: 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 dark:from-yellow-600 dark:via-yellow-500 dark:to-yellow-600',
    border: 'border-yellow-600/50',
    textMain: 'text-yellow-900 dark:text-yellow-950',
    textAccent: 'text-yellow-800 dark:text-yellow-900',
    digits: 'text-red-700 font-bold bg-white/50 dark:bg-black/20 px-2 py-1 rounded-sm border border-dashed border-red-500/50',
    badge: 'СЧАСТЛИВЫЙ БИЛЕТ',
    fallbackTitle: 'ЛОТЕРЕЯ',
    perforation: 'border-yellow-700/40',
    extraBg: 'bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.04),rgba(0,0,0,0.04)_2px,transparent_2px,transparent_4px)]',
  },
};

export const TicketCard: React.FC<TicketCardProps> = ({ digits, category = 'cinema', categoryName }) => {
  const displayDigits = digits && digits.length === 6 
    ? `${digits.slice(0, 3).join('')} ${digits.slice(3, 6).join('')}`
    : '••• •••';

  const barcodeBars = [80, 40, 100, 60, 30, 90, 50, 100, 70, 40, 80, 100, 60, 40, 90];
  const theme = THEMES[category] || THEMES['cinema'];

  return (
    <div className="w-[94%] max-w-[390px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.7)] -rotate-1 select-none pointer-events-none z-20 mx-auto">
      <div 
        className={`w-full h-[140px] sm:h-[155px] rounded-xl ${theme.bg} border ${theme.border} flex relative overflow-hidden`}
        style={{
          WebkitMaskImage: 'radial-gradient(circle at 75% 0px, transparent 10px, black 11px), radial-gradient(circle at 75% 100%, transparent 10px, black 11px)',
          WebkitMaskSize: '100% 51%, 100% 51%',
          WebkitMaskPosition: 'top, bottom',
          WebkitMaskRepeat: 'no-repeat',
          maskImage: 'radial-gradient(circle at 75% 0px, transparent 10px, black 11px), radial-gradient(circle at 75% 100%, transparent 10px, black 11px)',
          maskSize: '100% 51%, 100% 51%',
          maskPosition: 'top, bottom',
          maskRepeat: 'no-repeat',
        }}
      >
        {theme.extraBg && (
          <div className={`absolute inset-0 pointer-events-none ${theme.extraBg}`}></div>
        )}

        {/* Main Ticket Section (Left, ~75%) */}
        <div className={`w-[75%] h-full flex flex-col justify-between p-4 sm:p-5 border-r-2 border-dashed ${theme.perforation} relative z-10`}>
          <div className={`flex justify-between items-start text-[10px] sm:text-xs font-bold uppercase tracking-widest ${theme.textMain}`}>
            <span className="max-w-[50%] line-clamp-2 leading-tight">
              {categoryName || theme.fallbackTitle}
            </span>
            <span className={`text-right leading-tight ${theme.textAccent}`}>
              {theme.badge}
            </span>
          </div>
          
          <div className="flex-1 flex items-center justify-center mt-1">
            <span className={`font-mono font-black text-4xl sm:text-5xl tracking-[0.18em] whitespace-nowrap ${theme.digits}`}>
              {displayDigits}
            </span>
          </div>
        </div>

        {/* Stub Section (Right, ~25%) */}
        <div className={`w-[25%] h-full flex flex-col items-center justify-between py-4 sm:py-5 relative z-10 ${theme.textMain}`}>
          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 ${theme.textAccent}`}>
            КОНТРОЛЬ
          </span>
          
          <div className="flex items-end justify-center gap-[2px] h-10 w-full px-2 opacity-70">
            {barcodeBars.map((height, i) => (
              <div 
                key={i} 
                className="w-[2px] sm:w-[3px] bg-current rounded-t-sm"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
