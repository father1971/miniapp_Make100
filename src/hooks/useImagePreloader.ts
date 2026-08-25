import { useState, useEffect } from 'react';

/**
 * Хук для предзагрузки фоновых изображений автомобилей.
 * Загружает все переданные URL-адреса изображений в кэш браузера,
 * чтобы предотвратить "мерцание" (мигание) при смене билетов.
 * 
 * @param imageUrls Массив строк с URL-адресами изображений для предзагрузки.
 * @returns boolean Флаг imagesLoaded, равный true, когда все изображения загружены.
 */
export function useImagePreloader(imageUrls: string[]) {
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    
    if (!imageUrls || imageUrls.length === 0) {
      setImagesLoaded(true);
      return;
    }

    // Сбрасываем состояние при получении нового списка URL
    setImagesLoaded(false);

    let loadedCount = 0;
    const totalImages = imageUrls.length;

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        if (isMounted) {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        }
      };
      img.onerror = () => {
        // Даже если изображение не удалось загрузить, мы считаем его обработанным
        if (isMounted) {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        }
      };
    });

    return () => {
      isMounted = false;
    };
  }, [imageUrls]);

  return imagesLoaded;
}
