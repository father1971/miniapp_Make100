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
  badgeLeft: string;
  badgeRight: string;
  perforation: string;
  extraStyles?: React.ReactNode;
};

const THEMES: Record<string, ThemeDef> = {
  theatre: {
    bg: 'bg-[#5B1019]',
    border: 'border-[#3a0a10]',
    textMain: 'text-[#cfb53b] font-serif',
    textAccent: 'text-[#e6d070] font-serif',
    digits: 'text-[#cfb53b] drop-shadow-[0_0_8px_rgba(207,181,59,0.5)] mix-blend-screen opacity-90',
    badgeLeft: 'ТЕАТРАЛЬНЫЙ БИЛЕТ',
    badgeRight: 'ПАРТЕР • РЯД 3 • ЛОЖА №5',
    perforation: 'border-[#cfb53b]/40',
    extraStyles: <div className="absolute inset-1.5 sm:inset-2 border-4 border-double border-[#cfb53b]/60 pointer-events-none rounded-md" />
  },
  bus: {
    bg: 'bg-[#d9d4c7]',
    border: 'border-[#8c8577]',
    textMain: 'text-[#3d3830] font-sans font-bold',
    textAccent: 'text-[#5c5549]',
    digits: 'text-[#a51c24] mix-blend-multiply opacity-85',
    badgeLeft: 'БИЛЕТ НА АВТОБУС',
    badgeRight: 'ЦЕНА 6 КОП.',
    perforation: 'border-[#8c8577]/50',
    extraStyles: <div className="absolute top-3 right-[26%] w-5 h-5 rounded-full bg-black/15 mix-blend-multiply shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" />
  },
  flight: {
    bg: 'bg-gradient-to-br from-[#e0f2fe] to-white',
    border: 'border-[#bae6fd]',
    textMain: 'text-[#075985] font-sans font-bold',
    textAccent: 'text-[#0284c7]',
    digits: 'text-[#0f172a] mix-blend-multiply opacity-90',
    badgeLeft: 'FLIGHT SU-100',
    badgeRight: 'SVO ✈ DXB • GATE B22',
    perforation: 'border-[#94a3b8]/40',
  },
  train: {
    bg: 'bg-[#0c4a45]',
    border: 'border-[#14b8a6]',
    textMain: 'text-[#5eead4] font-sans tracking-wide',
    textAccent: 'text-[#99f6e4]',
    digits: 'text-[#14b8a6] mix-blend-screen drop-shadow-md',
    badgeLeft: 'Ж/Д БИЛЕТ',
    badgeRight: 'МЕЖДУГОРОДНИЙ КУПОН',
    perforation: 'border-[#2dd4bf]/40',
    extraStyles: <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,#2dd4bf_4px,#2dd4bf_5px),repeating-linear-gradient(-45deg,transparent,transparent_4px,#2dd4bf_4px,#2dd4bf_5px)] pointer-events-none mix-blend-overlay" />
  },
  concert: {
    bg: 'bg-[#1a1a1a]',
    border: 'border-fuchsia-500/50',
    textMain: 'text-fuchsia-400 font-sans font-black tracking-tighter',
    textAccent: 'text-cyan-400',
    digits: 'text-white mix-blend-overlay opacity-90 drop-shadow-[0_0_12px_rgba(217,70,239,0.8)]',
    badgeLeft: 'CONCERT PASS',
    badgeRight: 'FAN ZONE • ACCESS ALL AREAS',
    perforation: 'border-fuchsia-500/40',
    extraStyles: (
      <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-b from-purple-500 via-pink-500 to-yellow-500 opacity-90 mix-blend-screen bg-[size:4px_4px] bg-[linear-gradient(135deg,rgba(255,255,255,0.4)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.4)_75%,transparent_75%,transparent)]" />
    )
  },
  stadium: {
    bg: 'bg-[#165a26]',
    border: 'border-[#4ade80]',
    textMain: 'text-white font-sans font-black italic',
    textAccent: 'text-[#86efac]',
    digits: 'text-[#facc15] drop-shadow-[1px_2px_0_rgba(0,0,0,0.8)]',
    badgeLeft: 'STADIUM TICKET',
    badgeRight: 'MATCH DAY • SECTOR C • ROW 12',
    perforation: 'border-white/30',
    extraStyles: <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
  },
  cinema: {
    bg: 'bg-[#d97c2a]',
    border: 'border-[#9c5314]',
    textMain: 'text-[#fffbeb] font-serif font-bold',
    textAccent: 'text-[#fde68a]',
    digits: 'text-[#451a03] mix-blend-multiply opacity-80',
    badgeLeft: 'БИЛЕТ В КИНО',
    badgeRight: 'ADMIT ONE • СЕАНС 20:00',
    perforation: 'border-[#78350f]/40',
  },
  amusement: {
    bg: 'bg-[repeating-linear-gradient(45deg,#dc2626,#dc2626_12px,#ffffff_12px,#ffffff_24px)]',
    border: 'border-[#b91c1c]',
    textMain: 'text-[#dc2626] font-sans font-black',
    textAccent: 'text-[#b91c1c]',
    digits: 'text-[#991b1b] mix-blend-multiply drop-shadow-sm',
    badgeLeft: 'AMUSEMENT PARK',
    badgeRight: '★ UNLIMITED RIDES ★',
    perforation: 'border-[#dc2626]/40',
    extraStyles: <div className="absolute inset-2 sm:inset-2.5 rounded-lg bg-white/95 shadow-[inset_0_0_8px_rgba(0,0,0,0.2)] pointer-events-none" />
  },
  museum: {
    bg: 'bg-[#f4f4f4]',
    border: 'border-[#171717]',
    textMain: 'text-[#171717] font-sans tracking-tight',
    textAccent: 'text-[#525252]',
    digits: 'text-[#171717] font-light tracking-[0.25em] mix-blend-multiply',
    badgeLeft: 'EXHIBITION PASS',
    badgeRight: 'GENERAL ADMISSION',
    perforation: 'border-[#171717]',
  },
  lottery: {
    bg: 'bg-gradient-to-br from-[#d4af37] via-[#fff3b0] to-[#aa8022]',
    border: 'border-[#854d0e]',
    textMain: 'text-[#713f12] font-sans font-bold',
    textAccent: 'text-[#854d0e]',
    digits: 'text-[#b91c1c] font-black mix-blend-multiply opacity-90 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]',
    badgeLeft: 'ЛОТЕРЕЯ',
    badgeRight: 'СЧАСТЛИВЫЙ БИЛЕТ • JACKPOT',
    perforation: 'border-[#854d0e]/40',
    extraStyles: <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#713f12_1px,transparent_1px)] bg-[size:4px_4px]" />
  },
};

export const TicketCard: React.FC<TicketCardProps> = ({ digits, category = 'cinema', categoryName }) => {
  const displayDigits = digits && digits.length === 6 
    ? `${digits.slice(0, 3).join('')} ${digits.slice(3, 6).join('')}`
    : '••• •••';
    
  // Barcode visualization using pseudo-random heights based on the string
  const barcodeBars = [80, 40, 100, 60, 30, 90, 50, 100, 70, 40, 80, 100, 60, 40, 90, 100, 30, 50, 70, 40, 80];
  
  const theme = THEMES[category] || THEMES['cinema'];

  return (
    <div className="w-[94%] max-w-[273px] h-[100px] sm:h-[110px] drop-shadow-[0_15px_30px_rgba(0,0,0,0.75)] -rotate-1 select-none pointer-events-none z-20 mx-auto">
      <div 
        className={`w-full h-full rounded-xl ${theme.bg} border ${theme.border} flex relative overflow-hidden`}
        style={{
          WebkitMaskImage: 'radial-gradient(circle at 75% 0px, transparent 7px, black 8px), radial-gradient(circle at 75% 100%, transparent 7px, black 8px)',
          WebkitMaskSize: '100% 51%, 100% 51%',
          WebkitMaskPosition: 'top, bottom',
          WebkitMaskRepeat: 'no-repeat',
          maskImage: 'radial-gradient(circle at 75% 0px, transparent 7px, black 8px), radial-gradient(circle at 75% 100%, transparent 7px, black 8px)',
          maskSize: '100% 51%, 100% 51%',
          maskPosition: 'top, bottom',
          maskRepeat: 'no-repeat',
        }}
      >
        {theme.extraStyles}

        {/* Main Ticket Section (Left, ~75%) */}
        <div className={`w-[75%] h-full flex flex-col justify-between p-3 sm:p-3.5 border-r-2 border-dashed ${theme.perforation} relative z-10`}>
          <div className={`flex justify-between items-start text-[7px] sm:text-[8px] uppercase tracking-widest ${theme.textMain}`}>
            <span className="max-w-[45%] line-clamp-2 leading-tight">
              {categoryName || theme.badgeLeft}
            </span>
            <span className={`text-right leading-tight max-w-[50%] ${theme.textAccent}`}>
              {theme.badgeRight}
            </span>
          </div>
          
          <div className="flex-1 flex items-center justify-center mt-1 sm:mt-1.5">
            <span className={`font-mono font-black text-2xl sm:text-3xl tracking-[0.20em] whitespace-nowrap ${theme.digits}`}>
              {displayDigits}
            </span>
          </div>
        </div>

        {/* Stub Section (Right, ~25%) */}
        <div className={`w-[25%] h-full flex flex-col items-center justify-between py-3 sm:py-3.5 relative z-10 ${theme.textMain}`}>
          <span className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 ${theme.textAccent}`}>
            КОНТРОЛЬ
          </span>
          
          <div className="flex items-end justify-center gap-[1px] sm:gap-[1.5px] h-7 sm:h-8 w-full px-1.5 opacity-80">
            {barcodeBars.map((height, i) => (
              <div 
                key={i} 
                className="w-[1.5px] bg-current rounded-t-sm"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
