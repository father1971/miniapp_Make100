import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

insert_states = """  const [carImageLoaded, setCarImageLoaded] = useState<boolean>(false);
  const carImagesListRef = useRef<string[]>([]);
  const ticketImagesListRef = useRef<any[]>([]);
  const [recentCarUrls, setRecentCarUrls] = useState<string[]>([]);
  const [recentTicketUrls, setRecentTicketUrls] = useState<string[]>([]);

  const getSmartRandomItem = (pool: any[], recentUrls: string[], bufferSize: number = 6) => {
    if (!pool || pool.length === 0) return { item: null, updatedUrls: recentUrls };
    
    // Filter out recently shown URLs
    let available = pool.filter(item => !recentUrls.includes(item.url || item.imageUrl || item));
    
    // Fallback if the pool is smaller than the buffer size
    if (available.length === 0) {
      available = pool;
    }
    
    const randomIndex = Math.floor(Math.random() * available.length);
    const chosenItem = available[randomIndex];
    const chosenUrl = chosenItem.url || chosenItem.imageUrl || chosenItem;
    
    // Update history: add to front, slice to keep max buffer size
    const updatedUrls = [chosenUrl, ...recentUrls.filter(url => url !== chosenUrl)].slice(0, bufferSize);
    
    return { item: chosenItem, updatedUrls };
  };"""

content = content.replace(
    "  const [carImageLoaded, setCarImageLoaded] = useState<boolean>(false);\n  const carImagesListRef = useRef<string[]>([]);",
    insert_states
)

old_fetch_random = """  const fetchRandomTicket = useCallback(async () => {
    setIsVisualReady(false);
    try {
      const response = await fetch(`${API_URL}/api/tickets/random`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.ticket) {
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
        }
      }
    } catch (e) {
      console.warn('Failed to fetch random ticket:', e);
    }
  }, []);"""

new_fetch_random = """  const fetchRandomTicket = useCallback(async () => {
    setIsVisualReady(false);
    
    if (ticketImagesListRef.current && ticketImagesListRef.current.length > 0) {
      setRecentTicketUrls(prev => {
        const { item: chosenTicket, updatedUrls } = getSmartRandomItem(ticketImagesListRef.current, prev, 6);
        if (chosenTicket) {
          const img = new Image();
          img.onload = () => {
            setTicketBg({
              imageUrl: chosenTicket.imageUrl,
              category: chosenTicket.category,
              categoryName: chosenTicket.categoryName
            });
            setIsVisualReady(true);
          };
          img.src = chosenTicket.imageUrl;
        } else {
          setIsVisualReady(true);
        }
        return updatedUrls;
      });
      return;
    }

    // Fallback if pool empty
    try {
      const response = await fetch(`${API_URL}/api/tickets/random`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.ticket) {
          setRecentTicketUrls(prev => {
            const updatedUrls = [data.ticket.imageUrl, ...prev.filter(u => u !== data.ticket.imageUrl)].slice(0, 6);
            return updatedUrls;
          });
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
        }
      }
    } catch (e) {
      console.warn('Failed to fetch random ticket:', e);
    }
  }, []);"""
content = content.replace(old_fetch_random, new_fetch_random)

old_mount_effect = """  // Load cached images from localStorage immediately on mount to prevent any delay or rate limit issues
  useEffect(() => {
    try {
      const cached = localStorage.getItem('make100_kv_images');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          carImagesListRef.current = parsed;
          const newUrl = parsed[Math.floor(Math.random() * parsed.length)];
          const img = new Image();
          img.onload = () => setCarImage(newUrl);
          img.src = newUrl;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached KV images:', e);
    }
  }, []);"""

new_mount_effect = """  // Load cached images from localStorage immediately on mount to prevent any delay or rate limit issues
  useEffect(() => {
    try {
      const cached = localStorage.getItem('make100_kv_images');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          carImagesListRef.current = parsed;
          setRecentCarUrls(prev => {
            const { item: newUrl, updatedUrls } = getSmartRandomItem(parsed, prev, 6);
            if (newUrl) {
              const img = new Image();
              img.onload = () => setCarImage(newUrl);
              img.src = newUrl;
            }
            return updatedUrls;
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached KV images:', e);
    }
    
    try {
      const cachedTickets = localStorage.getItem('make100_kv_ticket_images');
      if (cachedTickets) {
        const parsed = JSON.parse(cachedTickets);
        if (Array.isArray(parsed) && parsed.length > 0) {
          ticketImagesListRef.current = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached KV ticket images:', e);
    }
  }, []);"""
content = content.replace(old_mount_effect, new_mount_effect)

old_fetch_effect = """  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${API_URL}/api/cars/pool`);
        if (!response.ok) throw new Error('Ошибка при загрузке пула картинок с бэкенда');
        
        const data = await response.json();
        const images = Array.isArray(data) ? data : (data.cars || data.pool || []);
        
        if (images.length > 0) {
          carImagesListRef.current = images;
          const newUrl = images[Math.floor(Math.random() * images.length)];
          const img = new Image();
          img.onload = () => setCarImage(newUrl);
          img.src = newUrl;
          try {
            localStorage.setItem('make100_kv_images', JSON.stringify(images));
          } catch (e) {
            console.warn('Failed to cache KV images:', e);
          }
        }
      } catch (err) {
        // Use console.warn instead of console.error to avoid raising fatal errors in test automation
        console.warn('Ошибка при получении картинок с бэкенда:', err);
      }
    };
    fetchImages();
  }, []);"""

new_fetch_effect = """  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${API_URL}/api/cars/pool`);
        if (!response.ok) throw new Error('Ошибка при загрузке пула картинок с бэкенда');
        
        const data = await response.json();
        const images = Array.isArray(data) ? data : (data.cars || data.pool || []);
        
        if (images.length > 0) {
          carImagesListRef.current = images;
          setRecentCarUrls(prev => {
            const { item: newUrl, updatedUrls } = getSmartRandomItem(images, prev, 6);
            if (newUrl) {
              const img = new Image();
              img.onload = () => setCarImage(newUrl);
              img.src = newUrl;
            }
            return updatedUrls;
          });
          try {
            localStorage.setItem('make100_kv_images', JSON.stringify(images));
          } catch (e) {
            console.warn('Failed to cache KV images:', e);
          }
        }
      } catch (err) {
        // Use console.warn instead of console.error to avoid raising fatal errors in test automation
        console.warn('Ошибка при получении картинок с бэкенда:', err);
      }

      // Fetch ticket pool
      try {
        const tResponse = await fetch(`${API_URL}/api/tickets/pool`);
        if (tResponse.ok) {
          const tData = await tResponse.json();
          const tickets = tData.tickets || [];
          if (tickets.length > 0) {
            ticketImagesListRef.current = tickets;
            try {
              localStorage.setItem('make100_kv_ticket_images', JSON.stringify(tickets));
            } catch (e) {
              console.warn('Failed to cache ticket KV images:', e);
            }
          }
        }
      } catch (err) {
        console.warn('Ошибка при получении билетов пула с бэкенда:', err);
      }
    };
    fetchImages();
  }, []);"""
content = content.replace(old_fetch_effect, new_fetch_effect)

old_init_game_images = """    // Set random car image
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

new_init_game_images = """    // Set random car image
    if (gameMode === 'ticket') {
      fetchRandomTicket();
    } else {
      if (carImagesListRef.current.length > 0) {
        setRecentCarUrls(prev => {
          const { item: newUrl, updatedUrls } = getSmartRandomItem(carImagesListRef.current, prev, 6);
          if (newUrl) {
            const img = new Image();
            img.onload = () => {
              setCarImage(newUrl);
              setIsVisualReady(true);
            };
            img.src = newUrl;
          } else {
            setIsVisualReady(true);
          }
          return updatedUrls;
        });
      } else {
        setIsVisualReady(true);
      }
    }"""
content = content.replace(old_init_game_images, new_init_game_images)

with open('src/App.tsx', 'w') as f:
    f.write(content)
