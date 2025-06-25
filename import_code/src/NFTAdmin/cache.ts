// example-widget-mui/src/NFTAdmin/cache.ts

// Define the CacheEntry interface
interface CacheEntry {
  nftImageUrl: string;
}

export const imageCache = new Map<string, CacheEntry>();

export const loadCacheFromStorage = () => {
  const cachedData = localStorage.getItem('nftImageCache');
  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    for (const [key, entry] of Object.entries(parsed)) {
      imageCache.set(key, entry as CacheEntry);
    }
  }
};

export const saveCacheToStorage = () => {
  const cacheObject = Object.fromEntries(imageCache);
  localStorage.setItem('nftImageCache', JSON.stringify(cacheObject));
};