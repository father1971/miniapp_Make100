const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const handleInviteFunc = `  const handleInviteFriend = () => {
    const myId = tgUser?.id;
    if (!myId) return;

    const botUsername = 'make100_bot'; 
    const inviteLink = \`https://t.me/\${botUsername}/app?startapp=\${myId}\`;

    navigator.clipboard.writeText(inviteLink);
    
    const shareText = \`Привет! Попробуй решить примеры на скорость в Make100! По этой ссылке ты получишь 250 монет на старт! 🪙\`;
    const shareUrl = \`https://t.me/share/url?url=\${encodeURIComponent(inviteLink)}&text=\${encodeURIComponent(shareText)}\`;
    
    if ((window as any).Telegram?.WebApp) {
      (window as any).Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  const showHint = () => {`;

code = code.replace(/  const showHint = \(\) => \{/, handleInviteFunc);

const inviteUi = `                {/* Invite Friend */}
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Пригласи друга</span>
                  <button 
                    onClick={() => { 
                      handleInviteFriend(); 
                      playSound('click'); 
                      playVibration('light'); 
                    }}
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                  >
                    <User size={18} /> Пригласить друга
                  </button>
                </div>

                {/* Game Mode */}`;

code = code.replace(/                \{\/\* Game Mode \*\/\}/, inviteUi);

fs.writeFileSync('src/App.tsx', code);
console.log('UI logic for referrals injected');
