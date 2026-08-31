import React from 'react';

interface LicensePlateProps {
  ticketDigits: string[];
  letters?: string[];
}

export const LicensePlate: React.FC<LicensePlateProps> = ({ ticketDigits, letters = ['A', 'B', 'C'] }) => {
  const l1 = letters[0] || 'A';
  const l2 = letters[1] || 'B';
  const l3 = letters[2] || 'C';

  const d13 = ticketDigits.slice(0, 3).join('');
  const d46 = ticketDigits.slice(3, 6).join('');

  return (
    <div className="absolute top-3 sm:top-3 left-1/2 -translate-x-1/2 scale-75 origin-top pointer-events-none z-20" style={{ perspective: "800px" }}>
      <div style={{ transform: "rotateX(6deg) rotateY(-8deg)" }} className="relative w-[270px] sm:w-[320px] h-[56px] sm:h-[64px] rounded-lg border-[1.5px] border-gray-400 bg-gradient-to-b from-white via-gray-100 to-gray-300 shadow-[inset_0_0_0_2.5px_#111,inset_0_3px_5px_rgba(255,255,255,1),inset_0_-3px_5px_rgba(0,0,0,0.2),0_15px_25px_rgba(0,0,0,0.7)] flex items-center overflow-hidden select-none">
        {/* Left mounting screw */}
        <div className="absolute left-0.5 sm:left-0.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.8)] flex items-center justify-center border border-gray-600 z-10">
          <div className="w-[60%] h-[1px] bg-gray-800 absolute rotate-45 shadow-[0_0.5px_0_rgba(255,255,255,0.4)]"></div>
          <div className="w-[60%] h-[1px] bg-gray-800 absolute -rotate-45 shadow-[0_0.5px_0_rgba(255,255,255,0.4)]"></div>
        </div>

        {/* Right mounting screw */}
        <div className="absolute right-0.5 sm:right-0.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.8)] flex items-center justify-center border border-gray-600 z-10">
          <div className="w-[60%] h-[1px] bg-gray-800 absolute rotate-[25deg] shadow-[0_0.5px_0_rgba(255,255,255,0.4)]"></div>
          <div className="w-[60%] h-[1px] bg-gray-800 absolute rotate-[-65deg] shadow-[0_0.5px_0_rgba(255,255,255,0.4)]"></div>
        </div>

        {/* Left accent */}
        <div className="w-3.5 sm:w-4 h-full bg-blue-700"></div>

        {/* Center section */}
        <div className="flex-1 flex items-center justify-center gap-1.5 font-mono font-black text-gray-800 text-4xl sm:text-[45px] tracking-wider leading-none pt-1" style={{ textShadow: '-1px -1px 1px rgba(255,255,255,0.9), 1px 2px 3px rgba(0,0,0,0.6), 0px 1px 1px rgba(0,0,0,0.8)' }}>
          <span>{l1}</span>
          <span>{d13}</span>
          <span>{l2}{l3}</span>
        </div>

        {/* Divider */}
        <div className="w-[2px] h-full bg-black/80"></div>

        {/* Right region section */}
        <div className="w-[90px] sm:w-[105px] pr-1.5 sm:pr-2 h-full flex items-center justify-center font-mono font-black text-gray-800 text-3xl sm:text-4xl tracking-widest bg-black/[0.03] leading-none pt-1" style={{ textShadow: '-1px -1px 1px rgba(255,255,255,0.9), 1px 2px 3px rgba(0,0,0,0.6), 0px 1px 1px rgba(0,0,0,0.8)' }}>
          {d46}
        </div>
      </div>
    </div>
  );
};
