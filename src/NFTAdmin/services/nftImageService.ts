// NFT Image Fetching Service - Direct implementation from import code
import { getFromCache, updateCache } from '../cache';

export interface NFTMetadata {
  issuer: string;
  taxon: string;
  imageUrl?: string;
  image_url?: string;
  metadata?: {
    image?: string;
    image_url?: string;
    imageUrl?: string;
  };
}

// Use local proxy to avoid CORS issues, the proxy is configured in vite.config.ts
const API_URL = '';  // Empty base URL will use the current origin with the proxy path

// API key - exactly matching import code
const API_KEY = '1234567890QWERTYUIOP';

/**
 * Validates if the issuer address has a valid format
 * @param issuer The issuer address to validate
 * @returns Boolean indicating if the format is valid
 */
const isValidIssuerFormat = (issuer: string): boolean => {
  return !!issuer.match(/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/);
};

// Fallback image for NFTs when fetch fails
const FALLBACK_IMAGE = 'https://placehold.co/400x400?text=NFT';

/**
 * Fetch NFT image URL - Direct implementation from import code
 * @param issuer The NFT issuer address
 * @param taxon The NFT taxon ID
 * @returns A promise that resolves to the NFT image URL or null if not found
 */
export const fetchNFTImageUrl = async (
  issuer: string,
  taxon: string
): Promise<string | null> => {
  // Early return if either issuer or taxon is missing
  if (!issuer || !taxon) {
    console.log('No issuer or taxon provided, skipping fetch');
    return null;
  }
  
  // Check issuer format as in import code
  if (!isValidIssuerFormat(issuer)) {
    console.error(`Invalid issuer format: ${issuer}`);
    return null;
  }
  
  // Check cache first to avoid unnecessary API calls
  const cacheKey = `${issuer}:${taxon}`;
  const cachedImageUrl = getFromCache(issuer, taxon);
  if (cachedImageUrl) {
    console.log(`Using cached image for ${cacheKey}: ${cachedImageUrl}`);
    return cachedImageUrl;
  }
  
  // Add debugging version - with detailed logs and direct XMLHttpRequest as backup
  try {
    console.log(`DEBUG: Starting fetch for NFT image - Issuer: ${issuer}, Taxon: ${taxon}`);

    // We'll try both fetch and XMLHttpRequest to see if either works
    const url = `${API_URL}/api/nfts/image-only?issuer=${encodeURIComponent(issuer)}&taxon=${encodeURIComponent(taxon)}`;
    console.log(`DEBUG: Request URL: ${url}`);
    console.log(`DEBUG: Using auth: Bearer ${API_KEY}`);

    // First approach: Try window.fetch directly (explicitly)
    console.log('DEBUG: Trying window.fetch approach');
    const fetchPromise = new Promise<string | null>((resolve, reject) => {
      window.fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      })
      .then(response => {
        console.log(`DEBUG: Fetch response status: ${response.status}`);
        if (!response.ok) {
          reject(new Error(`HTTP ${response.status}: ${response.statusText}`));
          return null;
        }
        return response.json();
      })
      .then(data => {
        if (!data) return;
        console.log('DEBUG: Response data received:', data);
        const imageUrl = data.imageUrl || null;
        if (!imageUrl) {
          reject(new Error('No imageUrl in response'));
          return;
        }
        resolve(imageUrl);
      })
      .catch(err => {
        console.error('DEBUG: Fetch attempt failed:', err);
        reject(err);
      });

      // Set a timeout for the fetch attempt
      setTimeout(() => {
        reject(new Error('Fetch timeout after 5 seconds'));
      }, 5000);
    });

    // Second approach: Try with XMLHttpRequest as fallback
    const xhrPromise = new Promise<string | null>((resolve, reject) => {
      console.log('DEBUG: Trying XMLHttpRequest approach');
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.setRequestHeader('Authorization', `Bearer ${API_KEY}`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        console.log(`DEBUG: XHR response status: ${xhr.status}`);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            console.log('DEBUG: XHR response data:', data);
            const imageUrl = data.imageUrl || null;
            if (!imageUrl) {
              reject(new Error('No imageUrl in XHR response'));
              return;
            }
            resolve(imageUrl);
          } catch (e) {
            console.error('DEBUG: Failed to parse XHR response:', e);
            reject(e);
          }
        } else {
          reject(new Error(`XHR HTTP ${xhr.status}`));
        }
      };
      
      xhr.onerror = function() {
        console.error('DEBUG: XHR network error');
        reject(new Error('XHR network error'));
      };
      
      xhr.timeout = 5000;
      xhr.ontimeout = function() {
        console.error('DEBUG: XHR request timed out');
        reject(new Error('XHR request timed out'));
      };
      
      xhr.send();
    });

    // Try both methods and race them
    const imageUrl = await Promise.race([
      fetchPromise.catch(err => {
        console.log('DEBUG: Fetch approach failed, falling back to XHR', err);
        // Log CORS issues specifically
        if (err instanceof TypeError && err.message.includes('network')) {
          console.error('DEBUG: This appears to be a CORS or network error');
        }
        return null;
      }),
      xhrPromise.catch(err => {
        console.log('DEBUG: XHR approach failed', err);
        return null;
      })
    ]);

    // If we got a result from either method
    if (imageUrl) {
      console.log(`DEBUG: Successfully fetched image URL: ${imageUrl}`);
      updateCache(issuer, taxon, imageUrl);
      return imageUrl;
    }
    
    // If we reached here, both methods failed
    console.error('DEBUG: Both fetch methods failed');
    throw new Error('Failed to fetch image URL through multiple methods');
  } catch (error) {
    console.error('Image fetch error:', error);
    return FALLBACK_IMAGE; // Simple fallback as in import code
  }
};

/**
 * Fetch full NFT metadata including image and traits
 * @param issuer The NFT issuer address
 * @param taxon The NFT taxon ID
 * @returns A promise that resolves to the NFT metadata or null if not found
 */
export const fetchNFTMetadata = async (
  issuer: string,
  taxon: string
): Promise<NFTMetadata | null> => {
  if (!issuer || !taxon) {
    return null;
  }
  
  if (!isValidIssuerFormat(issuer)) {
    console.error(`Invalid issuer format: ${issuer}`);
    return null;
  }
  
  try {
    const url = `${API_URL}/api/nfts/metadata?issuer=${encodeURIComponent(issuer)}&taxon=${encodeURIComponent(taxon)}`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as NFTMetadata;
  } catch (error) {
    console.error('Metadata fetch error:', error);
    return null;
  }
};

/**
 * Extract image URL from NFT metadata
 * @param metadata The NFT metadata object
 * @returns The image URL or null if not found
 */
export const extractImageUrl = (metadata: NFTMetadata): string | null => {
  if (!metadata) return null;
  
  // Try various common locations for image URLs in NFT metadata
  if (metadata.imageUrl) return metadata.imageUrl;
  if (metadata.image_url) return metadata.image_url;
  
  if (metadata.metadata) {
    if (metadata.metadata.image) return metadata.metadata.image;
    if (metadata.metadata.image_url) return metadata.metadata.image_url;
    if (metadata.metadata.imageUrl) return metadata.metadata.imageUrl;
  }
  
  return null;
};
