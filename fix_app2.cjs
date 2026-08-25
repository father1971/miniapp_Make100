const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Find the corrupted section around Gap and Action Buttons
const markerStart = '<Gap idx={idx + 1} value={gaps[idx + 1]} selected={selectedSlot === idx + 1} onClick={setSelectedSlot} />';
const markerEnd = '            <Lightbulb size={16} className={`shrink-0 ${isHinting ? "animate-pulse text-yellow-500" : ""}`} />';

const replacement = `<Gap idx={idx + 1} value={gaps[idx + 1]} selected={selectedSlot === idx + 1} onClick={setSelectedSlot} />
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
            <Lightbulb size={16} className={\`shrink-0 \${isHinting ? "animate-pulse text-yellow-500" : ""}\`} />`;

const regex = new RegExp(
  markerStart.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&') + 
  '[\\s\\S]*?' + 
  markerEnd.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&')
);

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content, 'utf8');
