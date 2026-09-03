const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add isPending state
content = content.replace(
  "const [isHinting, setIsHinting] = useState(false);",
  "const [isHinting, setIsHinting] = useState(false);\n  const [isPending, setIsPending] = useState(false);"
);

// Remove the setCarImageLoaded(false) useEffect
content = content.replace(
  `  useEffect(() => {
    if (carImage) {
      setCarImageLoaded(false);
    }
  }, [carImage]);\n\n`,
  ''
);

// Replace initGame's setCarImage
content = content.replace(
  `    // Set random car image
    if (carImagesListRef.current.length > 0) {
      setCarImage(carImagesListRef.current[Math.floor(Math.random() * carImagesListRef.current.length)]);
    }`,
  `    // Set random car image
    if (carImagesListRef.current.length > 0) {
      const newUrl = carImagesListRef.current[Math.floor(Math.random() * carImagesListRef.current.length)];
      const img = new Image();
      img.onload = () => setCarImage(newUrl);
      img.src = newUrl;
    }`
);

// Replace fetchCarImage's setCarImage
content = content.replace(
  `          setCarImage(images[Math.floor(Math.random() * images.length)]);
          try {
            localStorage.setItem('make100_kv_images', JSON.stringify(images));`,
  `          const newUrl = images[Math.floor(Math.random() * images.length)];
          const img = new Image();
          img.onload = () => setCarImage(newUrl);
          img.src = newUrl;
          try {
            localStorage.setItem('make100_kv_images', JSON.stringify(images));`
);

// Replace cached setCarImage
content = content.replace(
  `          carImagesListRef.current = parsed;
          setCarImage(parsed[Math.floor(Math.random() * parsed.length)]);
        }`,
  `          carImagesListRef.current = parsed;
          const newUrl = parsed[Math.floor(Math.random() * parsed.length)];
          const img = new Image();
          img.onload = () => setCarImage(newUrl);
          img.src = newUrl;
        }`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
