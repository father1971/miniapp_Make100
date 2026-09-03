import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add isVisualReady state
content = content.replace(
    "const [isPending, setIsPending] = useState(false);",
    "const [isPending, setIsPending] = useState(false);\n  const [isVisualReady, setIsVisualReady] = useState(false);"
)

# Update fetchRandomTicket
old_fetch = """        if (data.success && data.ticket) {
          setTicketBg({
            imageUrl: data.ticket.imageUrl,
            category: data.ticket.category,
            categoryName: data.ticket.categoryName
          });
        }"""
new_fetch = """        if (data.success && data.ticket) {
          const img = new Image();
          img.onload = () => {
            setTicketBg({
              imageUrl: data.ticket.imageUrl,
              category: data.ticket.category,
              categoryName: data.ticket.categoryName
            });
            setIsVisualReady(true);
          };
          img.src = data.ticket.imageUrl;
        }"""
content = content.replace(old_fetch, new_fetch)

# Update initGame
old_init = """    // Set random car image
    if (carImagesListRef.current.length > 0) {
      const newUrl = carImagesListRef.current[Math.floor(Math.random() * carImagesListRef.current.length)];
      const img = new Image();
      img.onload = () => setCarImage(newUrl);
      img.src = newUrl;
    }

    if (gameMode === 'ticket') {
      fetchRandomTicket();
    }"""
new_init = """    setIsVisualReady(false);
    // Set random car image
    if (gameMode === 'ticket') {
      fetchRandomTicket();
    } else {
      if (carImagesListRef.current.length > 0) {
        const newUrl = carImagesListRef.current[Math.floor(Math.random() * carImagesListRef.current.length)];
        const img = new Image();
        img.onload = () => {
          setCarImage(newUrl);
          setIsVisualReady(true);
        };
        img.src = newUrl;
      } else {
        setIsVisualReady(true);
      }
    }"""
content = content.replace(old_init, new_init)

# Connect isVisualReady to TicketCard wrapper (and License Plate for consistency)
old_render_wrapper = """<div className={`origin-center w-full h-full flex justify-center ${gameMode === 'ticket' ? 'items-end pb-4 sm:pb-8' : 'items-center'}`}>
              {gameMode === 'ticket' ? renderTicket() : renderLicensePlate()}
            </div>"""
new_render_wrapper = """<div className={`origin-center w-full h-full flex justify-center ${gameMode === 'ticket' ? 'items-end pb-4 sm:pb-8' : 'items-center'} transition-all duration-300 ${isVisualReady ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              {gameMode === 'ticket' ? renderTicket() : renderLicensePlate()}
            </div>"""
content = content.replace(old_render_wrapper, new_render_wrapper)

with open('src/App.tsx', 'w') as f:
    f.write(content)
