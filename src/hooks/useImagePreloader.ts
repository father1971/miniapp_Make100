import { useState, useEffect } from 'react';

// Модульный кэш уже загруженных URL, предотвращающий повторные сетевые запросы
const PRELOADED_CACHE = new Set<string>();

/**
 * Хук для предзагрузки фоновых изображений автомобилей и билетов.
 * Загружает все переданные URL-адреса изображений в кэш браузера,
 * чтобы предотвратить "мерцание" (мигание) при смене билетов.
 * 
 * @param imageUrls Массив строк с URL-адресами изображений для предзагрузки.
 * @returns boolean Флаг imagesLoaded, равный true, когда все изображения загружены.
 */
export function useImagePreloader(imageUrls: string[]) {
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(() => {
    if (!imageUrls || imageUrls.length === 0) return true;
    return imageUrls.every(url => PRELOADED_CACHE.has(url));
  });

  const urlsKey = (imageUrls || []).join('|');

  useEffect(() => {
    let isMounted = true;
    const activeImages: HTMLImageElement[] = [];

    if (!imageUrls || imageUrls.length === 0) {
      setImagesLoaded(true);
      return;
    }

    const unmemoizedUrls = imageUrls.filter(url => Boolean(url) && !PRELOADED_CACHE.has(url));

    if (unmemoizedUrls.length === 0) {
      setImagesLoaded(true);
      return;
    }

    setImagesLoaded(false);

    let completedCount = 0;
    const totalToLoad = unmemoizedUrls.length;

    const checkDone = (url: string) => {
      PRELOADED_CACHE.add(url);
      completedCount++;
      if (isMounted && completedCount === totalToLoad) {
        setImagesLoaded(true);
      }
    };

    unmemoizedUrls.forEach((url) => {
      const img = new Image();
      activeImages.push(img);

      img.onload = () => checkDone(url);
      img.onerror = () => {
        // Даже если изображение не удалось загрузить, мы считаем его обработанным
        checkDone(url);
      };

      img.src = url;
    });

    return () => {
      isMounted = false;
      // Очистка при размонтировании
      activeImages.forEach(img => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
      });
    };
  }, [urlsKey]);

  return imagesLoaded;
}
