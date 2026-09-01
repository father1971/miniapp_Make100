import React from 'react';

export interface TicketCardProps {
  digits: string[];
  category?: string;
  categoryName?: string;
}

export const TicketCard: React.FC<TicketCardProps> = ({ digits, category, categoryName }) => {
  const displayDigits = digits && digits.length === 6 
    ? `${digits.slice(0, 3).join('')} ${digits.slice(3, 6).join('')}`
    : '••• •••';

  // Decorative barcode pattern for the stub
  const barcodeBars = [80, 40, 100, 60, 30, 90, 50, 100, 70, 40, 80, 100, 60, 40, 90];

  return (
    <div className="drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)] -rotate-1 select-none pointer-events-none z-20">
      <div 
        className="w-[310px] sm:w-[340px] h-[125px] sm:h-[135px] rounded-xl bg-gradient-to-r from-amber-50 via-stone-100 to-amber-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 border border-amber-900/20 dark:border-white/10 flex relative"
        style={{
          WebkitMaskImage: 'radial-gradient(circle at 75% 0px, transparent 8px, black 9px), radial-gradient(circle at 75% 100%, transparent 8px, black 9px)',
          WebkitMaskSize: '100% 51%, 100% 51%',
          WebkitMaskPosition: 'top, bottom',
          WebkitMaskRepeat: 'no-repeat',
          maskImage: 'radial-gradient(circle at 75% 0px, transparent 8px, black 9px), radial-gradient(circle at 75% 100%, transparent 8px, black 9px)',
          maskSize: '100% 51%, 100% 51%',
          maskPosition: 'top, bottom',
          maskRepeat: 'no-repeat',
        }}
      >
        {/* Main Ticket Section (Left, ~75%) */}
        <div className="w-[75%] h-full flex flex-col justify-between p-4 sm:p-5 border-r-2 border-dashed border-stone-400 dark:border-zinc-600">
          <div className="flex justify-between items-start text-[10px] sm:text-xs font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest">
            <span>{categoryName || 'ВХОДНОЙ БИЛЕТ'}</span>
            <span>СЕРИЯ М-100</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center mt-1">
            <span className="font-mono font-black text-2xl sm:text-3xl tracking-[0.25em] text-red-700 dark:text-red-500 mix-blend-multiply dark:mix-blend-screen opacity-90">
              {displayDigits}
            </span>
          </div>
        </div>

        {/* Stub Section (Right, ~25%) */}
        <div className="w-[25%] h-full flex flex-col items-center justify-between py-4 sm:py-5">
          <span className="text-[10px] sm:text-xs font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">
            КОНТРОЛЬ
          </span>
          
          <div className="flex items-end justify-center gap-[2px] h-10 w-full px-2 opacity-60 dark:opacity-40">
            {barcodeBars.map((height, i) => (
              <div 
                key={i} 
                className="w-[2px] sm:w-[3px] bg-stone-800 dark:bg-zinc-300 rounded-t-sm"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
