const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `            <Gap idx={0} value={gaps[0]} selected={selectedSlot === 0} onClick={setSelectedSlot} isCarMode={isCarMode} />
            
            {digits.map((digit, idx) => (
              <React.Fragment key={idx}>
                <span className={\`drop-shadow-sm select-none flex-shrink-0 leading-none \${isCarMode ? 'text-white' : 'text-zinc-800 dark:text-zinc-200'}\`}>{digit}</span>
                <Gap idx={idx + 1} value={gaps[idx + 1]} selected={selectedSlot === idx + 1} onClick={setSelectedSlot} isCarMode={isCarMode} />
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-zinc-400 dark:text-zinc-500 text-xs sm:text-sm md:text-base mt-2 md:mt-3 font-bold">{t.tapGaps}</p>
        </div>

        {/* Keypad */}
        <div className="flex gap-1 sm:gap-2 flex-nowrap justify-between sm:justify-center w-full max-w-3xl px-1 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <OperatorButton op="+" icon={<Plus size={20} strokeWidth={3} />} onClick={() => handleOp('+')} isCarMode={isCarMode} />
          <OperatorButton op="-" icon={<Minus size={20} strokeWidth={3} />} onClick={() => handleOp('-')} isCarMode={isCarMode} />
          <OperatorButton op="*" icon={<X size={20} strokeWidth={3} />} onClick={() => handleOp('*')} isCarMode={isCarMode} />
          <OperatorButton op="/" icon={<Divide size={20} strokeWidth={3} />} onClick={() => handleOp('/')} isCarMode={isCarMode} />
          <OperatorButton op="(" icon={<span className="text-xl font-black">(</span>} onClick={() => handleOp('(')} isCarMode={isCarMode} />
          <OperatorButton op=")" icon={<span className="text-xl font-black">)</span>} onClick={() => handleOp(')')} isCarMode={isCarMode} />
          <OperatorButton op="," icon={<span className="text-xl font-black">,</span>} onClick={() => handleOp(',')} isCarMode={isCarMode} />
          <OperatorButton op="Backspace" icon={<Delete size={20} strokeWidth={2.5} />} onClick={() => handleOp('Backspace')} variant="danger" isCarMode={isCarMode} />
        </div>

        {/* Action Buttons */}
        <div className="mt-2 sm:mt-4 w-full max-w-lg grid grid-cols-2 gap-2 sm:gap-3 shrink-0 z-10 pb-12 sm:pb-6">
          <button 
            onClick={showHint}
            disabled={isHinting || won}
            className={\`flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 transition-all font-bold tracking-wide text-xs sm:text-base \${
              isCarMode 
                ? 'glass-panel text-white hover:bg-white/20 border-white/20' 
                : 'border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 backdrop-blur-md'
            } \${isHinting || won ? 'opacity-50 cursor-not-allowed' : ''}\`}
          >
            <Lightbulb size={16} className={\`shrink-0 \${isHinting ? "animate-pulse text-yellow-500" : ""}\`} />
            <span className="truncate">{t.hint}</span>
          </button>
          <button 
            onClick={() => initGame(false, true)}
            disabled={isHinting}
            className={\`flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 transition-all font-bold tracking-wide text-xs sm:text-base \${
              isCarMode
                ? 'glass-panel text-white hover:bg-white/20 border-white/20'
                : isHinting ? 'opacity-50 cursor-not-allowed border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 backdrop-blur-md' 
                : noSolutionMessage ? 'animate-pulse ring-4 ring-red-500/30 border-red-500 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 backdrop-blur-md' 
                : 'border-zinc-300 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 backdrop-blur-md'
            }\`}
          >
            <RefreshCw size={16} className={\`shrink-0 \${isHinting ? "animate-spin" : ""}\`} />
            <span className="truncate">
              {hintUsed 
                ? (gameMode === 'ticket' ? t.nextTicket : t.nextCar)
                : (gameMode === 'ticket' ? t.skipTicket : t.skipCar)}
            </span>
          </button>
        </div>`;

// Delete everything from `<Gap idx={0}` up to `</button>\n        </div>` (action buttons ending).
const startMarker = '<Gap idx={0} value={gaps[0]}';
const endMarker = ": (gameMode === 'ticket' ? t.skipTicket : t.skipCar)}\n            </span>\n          </button>\n        </div>";

const regex = new RegExp(
  startMarker.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&') + 
  '[\\s\\S]*?' + 
  endMarker.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&')
);

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content, 'utf8');
