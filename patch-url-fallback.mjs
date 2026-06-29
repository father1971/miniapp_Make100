import fs from 'fs';

const filePath = './src/App.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const targetUrlFallback = `        // 3. Try URL query and hash parameters direct fallback (super robust detecting game/bot launch params)
        if (isPreviewEnv) {
          const urlParams = new URLSearchParams(window.location.search);`;

const replaceUrlFallback = `        // 3. Try URL query and hash parameters direct fallback (super robust detecting game/bot launch params)
        {
          const urlParams = new URLSearchParams(window.location.search);`;

content = content.replace(targetUrlFallback, replaceUrlFallback);

const targetEndIf = `            }
            return true;
          }
        }

        // Try getting it from the unsafe data if valid`;

const replaceEndIf = `            }
            return true;
          }
        }

        // Try getting it from the unsafe data if valid`;

// Actually just replacing the 'if (isPreviewEnv) {' with '{' is enough, since it's just a block.
fs.writeFileSync(filePath, content, 'utf-8');
console.log("Patched URL fallback");
