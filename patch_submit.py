import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const handleSkip = async () => {\n    if (isHinting) return;",
    "const handleSkip = async () => {\n    if (isHinting || isPending) return;\n    setIsPending(true);"
)

content = content.replace(
    "// trigger next round\n    initGame(false, true);\n  };",
    "// trigger next round\n    initGame(false, true);\n    setIsPending(false);\n  };"
)

content = content.replace(
    "      submitGameSolve({\n        formula: fullExpression,\n        digits: digits,\n        elapsedTimeMs: exactSolveTimeMs,\n        gameMode: gameMode\n      }).then(res => {",
    "      setIsPending(true);\n      submitGameSolve({\n        formula: fullExpression,\n        digits: digits,\n        elapsedTimeMs: exactSolveTimeMs,\n        gameMode: gameMode\n      }).then(res => {"
)

content = content.replace(
    "             if (tg?.HapticFeedback?.notificationOccurred) {\n               try { tg.HapticFeedback.notificationOccurred('success'); } catch (e) {}\n             }\n          }\n        }\n      });",
    "             if (tg?.HapticFeedback?.notificationOccurred) {\n               try { tg.HapticFeedback.notificationOccurred('success'); } catch (e) {}\n             }\n          }\n        }\n      }).finally(() => {\n        setIsPending(false);\n      });"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
