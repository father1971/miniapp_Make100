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
    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 pointer-events-none z-20">
      <div 
        className="bg-[#f0f0f0] shadow-xl rounded border-[3px] border-black flex flex-col items-center justify-center transform -rotate-2 overflow-hidden" 
        style={{ width: '130px', height: '95px', boxShadow: 'inset 0 0 5px rgba(0,0,0,0.3), 0 10px 15px -3px rgba(0,0,0,0.5)' }}
      >
        {/* Болтики */}
        <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full shadow-sm border border-gray-500"></div>
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full shadow-sm border border-gray-500"></div>
        <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full shadow-sm border border-gray-500"></div>
        <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full shadow-sm border border-gray-500"></div>

        {/* Внутренняя каемка (выштамповка) */}
        <div className="absolute inset-0.5 rounded border border-gray-400 pointer-events-none opacity-50"></div>
        
        {/* Верхняя строка: Буква и 3 цифры */}
        <div className="flex items-end gap-1.5 text-black font-sans leading-none mt-2" style={{ textShadow: '-1px -1px 0 rgba(255,255,255,0.7), 1px 1px 0 rgba(0,0,0,0.2)' }}>
          <span className="text-xl font-bold mb-0.5">{l1}</span>
          <span className="text-4xl font-black tracking-widest">{d13}</span>
        </div>
        
        {/* Нижняя строка: 2 буквы и 3 цифры */}
        <div className="flex items-end gap-1.5 text-black font-sans leading-none mb-2 mt-1" style={{ textShadow: '-1px -1px 0 rgba(255,255,255,0.7), 1px 1px 0 rgba(0,0,0,0.2)' }}>
          <span className="text-xl font-bold mb-0.5">{l2}{l3}</span>
          <span className="text-3xl font-black tracking-widest">{d46}</span>
        </div>
      </div>
    </div>
  );
};
