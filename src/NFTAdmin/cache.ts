// NFT Image Cache Utility

interface CacheEntry {
  nftImageUrl: string;
  timestamp: number; // When the cache entry was created/updated
}

// In-memory cache for NFT images
export const imageCache = new Map<string, CacheEntry>();

// Generate a cache key from issuer and taxon
export const getCacheKey = (issuer: string, taxon: string): string => {
  return `${issuer.toLowerCase()}-${taxon}`;
};

// Load image cache from localStorage
export const loadCacheFromStorage = (): void => {
  try {
    const cachedData = localStorage.getItem('nftImageCache');
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      for (const [key, entry] of Object.entries(parsed)) {
        imageCache.set(key, entry as CacheEntry);
      }
    }
  } catch (error) {
    console.error('Failed to load NFT image cache:', error);
  }
};

// Save image cache to localStorage
export const saveCacheToStorage = (): void => {
  try {
    const cacheObject = Object.fromEntries(imageCache);
    localStorage.setItem('nftImageCache', JSON.stringify(cacheObject));
  } catch (error) {
    console.error('Failed to save NFT image cache:', error);
  }
};

// Add or update a cache entry
export const updateCache = (issuer: string, taxon: string, imageUrl: string): void => {
  const key = getCacheKey(issuer, taxon);
  imageCache.set(key, {
    nftImageUrl: imageUrl,
    timestamp: Date.now()
  });
  saveCacheToStorage();
};

// Get an image URL from cache if available
export const getFromCache = (issuer: string, taxon: string): string | null => {
  const key = getCacheKey(issuer, taxon);
  const entry = imageCache.get(key);
  
  if (!entry) return null;
  
  // Cache expiration - 24 hours
  const CACHE_TTL = 24 * 60 * 60 * 1000;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    imageCache.delete(key);
    saveCacheToStorage();
    return null;
  }
  
  return entry.nftImageUrl;
};

// Initialize cache on module import
loadCacheFromStorage();
