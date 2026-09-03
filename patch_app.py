import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace the Profile modal
# It starts around line 2930: "{isProfileOpen && ("
# and ends when we find the closing braces of this block.
# We'll use a simpler approach: finding the start string and then tracking braces to replace exactly the block.

start_marker = "{isProfileOpen && ("
end_marker = "      )}\n    </div>\n  );\n}"

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    # We want to replace from start_idx up to the character right before end_marker
    new_content = content[:start_idx] + """<UserProfile 
        isOpen={isProfileOpen}
        onClose={() => { setIsProfileOpen(false); playSound('click'); playVibration('light'); }}
        stats={stats}
        tgUser={tgUser}
        language={language}
        t={t}
        solvedCount={solvedCount}
        unsolvedCount={unsolvedCount}
        totalSolveTime={totalSolveTime}
        bestTimeMs={bestTimeMs}
        minCharacters={minCharacters}
        formatBestTime={formatBestTime}
        formatTotalPlayTime={formatTotalPlayTime}
        formatRegistrationDate={formatRegistrationDate}
        handleInviteFriend={handleInviteFriend}
        playSound={playSound}
        playVibration={playVibration}
      />
""" + end_marker

    with open('src/App.tsx', 'w') as f:
        f.write(new_content)
    print("Success")
else:
    print("Markers not found.")
