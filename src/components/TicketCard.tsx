import React from 'react';
import { 
  Drama, 
  Bus, 
  Plane, 
  Train, 
  Guitar, 
  Trophy, 
  Film, 
  FerrisWheel, 
  Landmark, 
  TramFront, 
  Snowflake, 
  Tent,
  Ticket as TicketIcon
} from 'lucide-react';

export interface TicketCardProps {
  t?: any;
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
  titleKey: string;
  descKey: string;
  perforation: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass?: string;
  stampText: string;
  stampClass: string;
  stampRotation?: string;
  extraStyles?: React.ReactNode;
};

const THEMES: Record<string, ThemeDef> = {
  // 1. theatre (Burgundy/gold theme, theater mask icon)
  theatre: {
    bg: 'bg-gradient-to-br from-[#4a0814] via-[#5c0f1d] to-[#36040c]',
    border: 'border-[#d4af37] ring-1 ring-[#d4af37]/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]',
    textMain: 'text-[#fef3c7] font-serif font-bold',
    textAccent: 'text-[#d4af37]',
    digits: 'text-[#fffbeb] font-serif font-black drop-shadow-[0_0_10px_rgba(212,175,55,0.85)] tracking-[0.22em]',
    titleKey: 'ticketTheatreTitle',
    descKey: 'ticketTheatreDesc',
    perforation: 'border-[#d4af37]/50',
    icon: Drama,
    iconClass: 'text-[#d4af37]',
    stampText: 'THEATRE',
    stampClass: 'text-[#d4af37]',
    stampRotation: '-rotate-12',
    extraStyles: (
      <div className="absolute inset-1.5 sm:inset-2 border-2 border-double border-[#d4af37]/40 pointer-events-none rounded-md" />
    )
  },

  // 2. bus (Orange/warm-grey theme, bus icon)
  bus: {
    bg: 'bg-gradient-to-br from-[#ece5d8] to-[#d8cebc]',
    border: 'border-[#ea580c]/80 shadow-[0_0_12px_rgba(234,88,12,0.25)]',
    textMain: 'text-[#292524] font-sans font-black',
    textAccent: 'text-[#c2410c] font-bold',
    digits: 'text-[#9a3412] font-mono font-black drop-shadow-sm tracking-[0.20em]',
    titleKey: 'ticketBusTitle',
    descKey: 'ticketBusDesc',
    perforation: 'border-[#78716c]/50',
    icon: Bus,
    iconClass: 'text-[#ea580c]',
    stampText: 'TRANSIT',
    stampClass: 'text-[#ea580c]',
    stampRotation: 'rotate-6',
    extraStyles: (
      <div className="absolute top-2.5 right-[27%] w-4 h-4 rounded-full bg-black/20 mix-blend-multiply shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] pointer-events-none" />
    )
  },

  // 3. flight (Cyan/blue aviation theme, plane icon, boarding pass style)
  flight: {
    bg: 'bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#075985]',
    border: 'border-[#38bdf8] ring-1 ring-[#7dd3fc]/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]',
    textMain: 'text-white font-sans font-black tracking-wider',
    textAccent: 'text-[#bae6fd] font-semibold',
    digits: 'text-white font-mono font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] tracking-[0.24em]',
    titleKey: 'ticketFlightTitle',
    descKey: 'ticketFlightDesc',
    perforation: 'border-[#7dd3fc]/60',
    icon: Plane,
    iconClass: 'text-[#7dd3fc]',
    stampText: 'BOARDING',
    stampClass: 'text-[#7dd3fc]',
    stampRotation: '-rotate-6',
    extraStyles: (
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,rgba(255,255,255,0.04)_20px,rgba(255,255,255,0.04)_40px)] pointer-events-none" />
    )
  },

  // 4. train (Emerald green/brass theme, train icon)
  train: {
    bg: 'bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#022c22]',
    border: 'border-[#eab308] ring-1 ring-[#ca8a04]/50 shadow-[0_0_15px_rgba(234,179,8,0.25)]',
    textMain: 'text-[#fef08a] font-sans font-bold tracking-wide',
    textAccent: 'text-[#6ee7b7]',
    digits: 'text-[#fef08a] font-mono font-black drop-shadow-[0_0_8px_rgba(234,179,8,0.75)] tracking-[0.22em]',
    titleKey: 'ticketTrainTitle',
    descKey: 'ticketTrainDesc',
    perforation: 'border-[#eab308]/50',
    icon: Train,
    iconClass: 'text-[#eab308]',
    stampText: 'EXPRESS',
    stampClass: 'text-[#eab308]',
    stampRotation: 'rotate-12',
    extraStyles: (
      <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,#eab308_4px,#eab308_5px),repeating-linear-gradient(-45deg,transparent,transparent_4px,#eab308_4px,#eab308_5px)] pointer-events-none" />
    )
  },

  // 5. concert (Purple/neon magenta theme, guitar/concert icon)
  concert: {
    bg: 'bg-gradient-to-br from-[#2e1065] via-[#3b0764] to-[#17042a]',
    border: 'border-fuchsia-500 ring-1 ring-pink-500/50 shadow-[0_0_20px_rgba(217,70,239,0.4)]',
    textMain: 'text-fuchsia-300 font-sans font-black tracking-tight',
    textAccent: 'text-cyan-400 font-bold',
    digits: 'text-white font-mono font-black drop-shadow-[0_0_12px_rgba(236,72,153,0.95)] tracking-[0.22em]',
    titleKey: 'ticketConcertTitle',
    descKey: 'ticketConcertDesc',
    perforation: 'border-fuchsia-500/50',
    icon: Guitar,
    iconClass: 'text-pink-400',
    stampText: 'LIVE VIP',
    stampClass: 'text-fuchsia-400',
    stampRotation: '-rotate-12',
    extraStyles: (
      <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-purple-500 via-pink-500 to-cyan-400 opacity-85 pointer-events-none" />
    )
  },

  // 6. stadium (Field green theme, soccer ball/trophy icon)
  stadium: {
    bg: 'bg-gradient-to-br from-[#14532d] via-[#166534] to-[#052e16]',
    border: 'border-[#4ade80] ring-1 ring-[#22c55e]/50 shadow-[0_0_15px_rgba(74,222,128,0.3)]',
    textMain: 'text-white font-sans font-black italic tracking-wide',
    textAccent: 'text-[#86efac]',
    digits: 'text-[#facc15] font-mono font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-[0.22em]',
    titleKey: 'ticketStadiumTitle',
    descKey: 'ticketStadiumDesc',
    perforation: 'border-white/40',
    icon: Trophy,
    iconClass: 'text-[#facc15]',
    stampText: 'STADIUM',
    stampClass: 'text-[#4ade80]',
    stampRotation: 'rotate-6',
    extraStyles: (
      <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
    )
  },

  // 7. cinema (Charcoal/gold theme, film roll/popcorn icon)
  cinema: {
    bg: 'bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#0c0a09]',
    border: 'border-[#eab308] ring-1 ring-[#eab308]/50 shadow-[0_0_15px_rgba(234,179,8,0.25)]',
    textMain: 'text-[#fef08a] font-serif font-bold',
    textAccent: 'text-[#eab308]',
    digits: 'text-[#fef08a] font-mono font-black drop-shadow-[0_0_8px_rgba(234,179,8,0.75)] tracking-[0.22em]',
    titleKey: 'ticketCinemaTitle',
    descKey: 'ticketCinemaDesc',
    perforation: 'border-[#ca8a04]/50',
    icon: Film,
    iconClass: 'text-[#facc15]',
    stampText: 'ADMIT 1',
    stampClass: 'text-[#eab308]',
    stampRotation: '-rotate-12',
    extraStyles: (
      <div className="absolute top-0 bottom-0 left-1 w-1.5 flex flex-col justify-around py-1 opacity-25 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-sm bg-[#eab308]" />
        ))}
      </div>
    )
  },

  // 8. amusement (Pink/carnival theme, ferris wheel icon)
  amusement: {
    bg: 'bg-gradient-to-br from-[#e11d48] via-[#be123c] to-[#881337]',
    border: 'border-[#fbcfe8] ring-1 ring-[#f43f5e]/60 shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    textMain: 'text-white font-sans font-black tracking-wide',
    textAccent: 'text-[#fef08a]',
    digits: 'text-[#fef08a] font-mono font-black drop-shadow-[0_2px_4px_rgba(136,19,55,0.95)] tracking-[0.22em]',
    titleKey: 'ticketAmusementTitle',
    descKey: 'ticketAmusementDesc',
    perforation: 'border-white/40',
    icon: FerrisWheel,
    iconClass: 'text-[#fef08a]',
    stampText: 'CARNIVAL',
    stampClass: 'text-[#fbcfe8]',
    stampRotation: 'rotate-12',
    extraStyles: (
      <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full border-4 border-dashed border-white/20 pointer-events-none" />
    )
  },

  // 9. museum (Mahogany/amber theme, columns/art icon)
  museum: {
    bg: 'bg-gradient-to-br from-[#3b190f] via-[#451e13] to-[#200c06]',
    border: 'border-[#d97706] ring-1 ring-[#b45309]/50 shadow-[0_0_15px_rgba(217,119,6,0.25)]',
    textMain: 'text-[#fef3c7] font-serif font-bold tracking-tight',
    textAccent: 'text-[#f59e0b]',
    digits: 'text-[#fde68a] font-mono font-black drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] tracking-[0.24em]',
    titleKey: 'ticketMuseumTitle',
    descKey: 'ticketMuseumDesc',
    perforation: 'border-[#d97706]/50',
    icon: Landmark,
    iconClass: 'text-[#fbbf24]',
    stampText: 'GALLERIA',
    stampClass: 'text-[#d97706]',
    stampRotation: '-rotate-6',
    extraStyles: (
      <div className="absolute inset-1 border border-[#d97706]/30 pointer-events-none rounded-lg" />
    )
  },

  // 10. metro (Steel/dark blue subway theme, metro train icon)
  metro: {
    bg: 'bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617]',
    border: 'border-[#38bdf8] ring-1 ring-[#0284c7]/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]',
    textMain: 'text-[#38bdf8] font-mono font-black tracking-wider',
    textAccent: 'text-[#94a3b8]',
    digits: 'text-[#e0f2fe] font-mono font-black drop-shadow-[0_0_10px_rgba(56,189,248,0.85)] tracking-[0.22em]',
    titleKey: 'ticketMetroTitle',
    descKey: 'ticketMetroDesc',
    perforation: 'border-[#38bdf8]/40',
    icon: TramFront,
    iconClass: 'text-[#38bdf8]',
    stampText: 'SUBWAY',
    stampClass: 'text-[#38bdf8]',
    stampRotation: 'rotate-6',
    extraStyles: (
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 opacity-90 pointer-events-none" />
    )
  },

  // 11. ski (Ice blue/snow white theme, snowflake/goggles icon)
  ski: {
    bg: 'bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#075985]',
    border: 'border-white ring-2 ring-sky-200/70 shadow-[0_0_18px_rgba(186,230,253,0.45)]',
    textMain: 'text-[#e0f2fe] font-sans font-black tracking-wider',
    textAccent: 'text-cyan-200 font-bold',
    digits: 'text-white font-mono font-black drop-shadow-[0_2px_6px_rgba(3,105,161,0.95)] tracking-[0.24em]',
    titleKey: 'ticketSkiTitle',
    descKey: 'ticketSkiDesc',
    perforation: 'border-white/50',
    icon: Snowflake,
    iconClass: 'text-cyan-200',
    stampText: 'ALPINE',
    stampClass: 'text-white',
    stampRotation: '-rotate-12',
    extraStyles: (
      <div className="absolute top-1 right-2 opacity-25 pointer-events-none text-white">
        <Snowflake size={34} />
      </div>
    )
  },

  // 12. circus (Red-and-white stripes theme, circus tent icon)
  circus: {
    bg: 'bg-[repeating-linear-gradient(45deg,#b91c1c,#b91c1c_10px,#fff1f2_10px,#fff1f2_20px)]',
    border: 'border-[#991b1b] ring-2 ring-[#7f1d1d]/40 shadow-[0_0_15px_rgba(185,28,28,0.35)]',
    textMain: 'text-[#991b1b] font-sans font-black tracking-wider',
    textAccent: 'text-[#b91c1c] font-bold',
    digits: 'text-[#7f1d1d] font-mono font-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)] tracking-[0.22em]',
    titleKey: 'ticketCircusTitle',
    descKey: 'ticketCircusDesc',
    perforation: 'border-[#991b1b]/50',
    icon: Tent,
    iconClass: 'text-[#991b1b]',
    stampText: 'BIG TOP',
    stampClass: 'text-[#991b1b]',
    stampRotation: 'rotate-12',
    extraStyles: (
      <div className="absolute inset-1.5 rounded-lg bg-[#fffdfa]/95 border border-[#991b1b]/30 shadow-[inset_0_0_8px_rgba(0,0,0,0.12)] pointer-events-none" />
    )
  },

  // Backwards compatibility for lottery
  lottery: {
    bg: 'bg-gradient-to-br from-[#d4af37] via-[#fff3b0] to-[#aa8022]',
    border: 'border-[#854d0e]',
    textMain: 'text-[#713f12] font-sans font-bold',
    textAccent: 'text-[#854d0e]',
    digits: 'text-[#b91c1c] font-black mix-blend-multiply opacity-90 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]',
    titleKey: 'ticketLotteryTitle',
    descKey: 'ticketLotteryDesc',
    perforation: 'border-[#854d0e]/40',
    icon: TicketIcon,
    iconClass: 'text-[#854d0e]',
    stampText: 'JACKPOT',
    stampClass: 'text-[#854d0e]',
    stampRotation: '-rotate-12',
    extraStyles: (
      <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#713f12_1px,transparent_1px)] bg-[size:4px_4px]" />
    )
  },
};

// Map default fallback to cinema
THEMES.default = THEMES.cinema;

export const TicketCard: React.FC<TicketCardProps> = ({ digits, category, categoryName, t }) => {
  // Safe extraction of base category from compound strings (e.g. "flight_modern_day_clear" -> "flight")
  const baseCategory = category ? category.split('_')[0].toLowerCase() : 'default';
  
  const displayDigits = digits && digits.length === 6 
    ? `${digits.slice(0, 3).join('')} ${digits.slice(3, 6).join('')}`
    : '••• •••';
    
  // Barcode visualization using pseudo-random heights based on the string
  const barcodeBars = [80, 40, 100, 60, 30, 90, 50, 100, 70, 40, 80, 100, 60, 40, 90, 100, 30, 50, 70, 40, 80];
  
  const theme = THEMES[baseCategory] || THEMES.default;
  const CategoryIcon = theme.icon;

  return (
    <div className="w-[94%] max-w-[273px] h-[100px] sm:h-[110px] drop-shadow-[0_16px_32px_rgba(0,0,0,0.85)] -rotate-1 select-none pointer-events-none z-20 mx-auto">
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

        {/* Decorative Vintage SVG Stamp Watermark */}
        <div className={`absolute right-[27%] bottom-1 pointer-events-none select-none z-[5] ${theme.stampRotation || '-rotate-12'}`}>
          <svg 
            width="54" 
            height="54" 
            viewBox="0 0 100 100" 
            className={`w-12 h-12 sm:w-13 sm:h-13 opacity-30 sm:opacity-35 ${theme.stampClass}`}
          >
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 3" />
            <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <g fill="currentColor">
              <polygon points="50,14 52,19 57,19 53,22 55,27 50,24 45,27 47,22 43,19 48,19" transform="scale(0.8) translate(12, 4)" />
              <polygon points="50,86 52,91 57,91 53,94 55,99 50,96 45,99 47,94 43,91 48,91" transform="scale(0.8) translate(12, -4)" />
            </g>
            <text 
              x="50" 
              y="53" 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="12" 
              fontWeight="900" 
              letterSpacing="1.5" 
              fill="currentColor"
            >
              {theme.stampText}
            </text>
            <text 
              x="50" 
              y="68" 
              textAnchor="middle" 
              fontSize="7" 
              fontWeight="800" 
              letterSpacing="1" 
              fill="currentColor"
            >
              ★ ADMIT ★
            </text>
          </svg>
        </div>

        {/* Main Ticket Section (Left, ~75%) */}
        <div className={`w-[75%] h-full flex flex-col justify-between p-3 sm:p-3.5 border-r-2 border-dashed ${theme.perforation} relative z-10`}>
          <div className={`flex justify-between items-start text-[7px] sm:text-[8px] uppercase tracking-widest ${theme.textMain}`}>
            <div className="flex items-center gap-1 max-w-[48%] min-w-0">
              <CategoryIcon size={12} className={`shrink-0 ${theme.iconClass || theme.textAccent}`} />
              <span className="truncate leading-tight font-black">
                {categoryName || (t ? t[theme.titleKey as keyof typeof t] : '')}
              </span>
            </div>
            <span className={`text-right leading-tight max-w-[48%] truncate ${theme.textAccent}`}>
              {t ? t[theme.descKey as keyof typeof t] : ''}
            </span>
          </div>
          
          <div className="flex-1 flex items-center justify-center mt-1 sm:mt-1.5 relative z-10">
            <span className={`font-mono font-black text-2xl sm:text-3xl tracking-[0.20em] whitespace-nowrap ${theme.digits}`}>
              {displayDigits}
            </span>
          </div>
        </div>

        {/* Stub Section (Right, ~25%) */}
        <div className={`w-[25%] h-full flex flex-col items-center justify-between py-2.5 sm:py-3 relative z-10 ${theme.textMain}`}>
          <div className="flex flex-col items-center gap-0.5">
            <CategoryIcon size={11} className={`opacity-85 shrink-0 ${theme.iconClass || theme.textAccent}`} />
            <span className={`text-[6px] sm:text-[7px] font-black uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 ${theme.textAccent}`}>
              {t?.ticketControl || 'КОНТРОЛЬ'}
            </span>
          </div>
          
          <div className="flex items-end justify-center gap-[1px] sm:gap-[1.5px] h-6 sm:h-7 w-full px-1.5 opacity-85">
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
