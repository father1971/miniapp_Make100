const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The corrupted block starts at:
// className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
// And ends at:
// + 1} value={gaps[idx + 1]} selected={selectedSlot === idx + 1} onClick={setSelectedSlot} />

const markerStart = 'className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"\n                     {/* Action Buttons */}';
const markerEnd = '+ 1} value={gaps[idx + 1]} selected={selectedSlot === idx + 1} onClick={setSelectedSlot} />';

const replacement = `className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                >
                  <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-bold text-center shadow-2xl border-2 border-red-400 max-w-[90%]">
                    <div className="text-lg sm:text-xl mb-2">{t.noSolution}</div>
                    <div className="text-sm sm:text-base opacity-90 flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin-slow" />
                      {gameMode === 'ticket' ? t.skipTicket : t.skipCar}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
      </div>

      <div className="w-full flex flex-col items-center z-10 mt-auto flex-shrink-0">
        {/* Expression Builder */}
        <div className="w-full max-w-5xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-white/30 dark:border-zinc-800/60 p-1 sm:p-4 md:p-6 rounded-xl sm:rounded-[2rem] shadow-2xl mb-1 sm:mb-2 transition-colors flex flex-col items-center overflow-hidden">
          <div className="flex flex-nowrap justify-center items-center gap-x-[clamp(0.1rem,0.5vw,0.5rem)] text-[clamp(1.5rem,7vw,4rem)] font-mono font-black text-zinc-900 dark:text-white py-1 sm:py-2 w-full">
            <Gap idx={0} value={gaps[0]} selected={selectedSlot === 0} onClick={setSelectedSlot} />
            
            {digits.map((digit, idx) => (
              <React.Fragment key={idx}>
                <span className="text-zinc-800 dark:text-zinc-200 drop-shadow-sm select-none flex-shrink-0 leading-none">{digit}</span>
                <Gap idx={idx + 1} value={gaps[idx + 1]} selected={selectedSlot === idx + 1} onClick={setSelectedSlot} />`;

content = content.replace(markerStart, replacement);
fs.writeFileSync('src/App.tsx', content, 'utf8');
