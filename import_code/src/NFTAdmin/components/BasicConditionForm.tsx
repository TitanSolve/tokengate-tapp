// example-widget-mui/src/NFTAdmin/components/BasicConditionForm.tsx

import { useState, useEffect, useCallback } from 'react';
import { TextField, Box, Typography, CircularProgress, IconButton } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { ConditionTree, LockCondition } from '../types';
import { imageCache, saveCacheToStorage } from '../cache';
import debounce from 'lodash.debounce';

interface BasicConditionFormProps {
  onChange: (newTree: ConditionTree | null) => void;
  initialCondition: LockCondition | null;
}

export const BasicConditionForm = ({ onChange, initialCondition }: BasicConditionFormProps) => {
  const [issuer, setIssuer] = useState(initialCondition?.issuer || '');
  const [taxon, setTaxon] = useState(initialCondition?.taxon || '');
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(initialCondition?.nftImageUrl || null);
  const [fetchingImage, setFetchingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const apiUrl = 'https://15c32806-20be-45c8-b3ea-1f0a3e72dfb5-00-2ojqtwmdtbb4m.kirk.replit.dev';

  const fetchImage = useCallback(
    async (issuer: string, taxon: string) => {
      if (!issuer || !taxon) {
        console.log('No issuer or taxon provided, skipping fetch');
        setNftImageUrl(null);
        setImageError(null);
        return;
      }

      if (!issuer.match(/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/)) {
        console.error(`Invalid issuer format: ${issuer}`);
        setImageError('Invalid issuer address');
        setNftImageUrl(null);
        return;
      }

      console.log(`Fetching image with issuer: ${issuer}, taxon: ${taxon}`);
      const cacheKey = `${issuer}:${taxon}`;
      const cachedEntry = imageCache.get(cacheKey);

      if (cachedEntry && cachedEntry.nftImageUrl) {
        console.log(`Using cached image for ${cacheKey}: ${cachedEntry.nftImageUrl}`);
        setNftImageUrl(cachedEntry.nftImageUrl);
        setImageError(null);
        return;
      }

      setFetchingImage(true);
      setImageError(null);
      try {
        const url = `${apiUrl}/api/nfts/image-only?issuer=${encodeURIComponent(issuer)}&taxon=${encodeURIComponent(taxon)}`;
        console.log(`Sending request to: ${url}`);
        const response = await fetch(url, {
          headers: { Authorization: 'Bearer 1234567890QWERTYUIOP' },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        const fetchedUrl = data.imageUrl || null;
        if (!fetchedUrl) throw new Error('No imageUrl in response');
        console.log(`Fetched image URL: ${fetchedUrl}`);
        setNftImageUrl(fetchedUrl);
        imageCache.set(cacheKey, { nftImageUrl: fetchedUrl });
        saveCacheToStorage();
        if (fetchedUrl !== initialCondition?.nftImageUrl) {
          onChange({
            type: 'lock',
            id: initialCondition?.id || `lock-${Date.now()}`,
            issuer,
            taxon,
            nftCount: initialCondition?.nftCount || 1,
            nftImageUrl: fetchedUrl,
          });
        }
      } catch (error) {
        console.error('Image fetch error:', error);
        setImageError('Failed to fetch NFT image');
        setNftImageUrl(null);
      } finally {
        setFetchingImage(false);
      }
    },
    [initialCondition, onChange]
  );

  const debouncedFetchImage = useCallback(debounce(fetchImage, 1000), [fetchImage]);

  useEffect(() => {
    console.log(`Initial condition:`, initialCondition);
    if (issuer && taxon) {
      console.log(`Triggering fetchImage with issuer: ${issuer}, taxon: ${taxon}`);
      debouncedFetchImage(issuer, taxon);
    }
  }, [issuer, taxon, debouncedFetchImage]);

  const handleIssuerChange = (value: string) => {
    console.log(`Issuer changed to: ${value}`);
    setIssuer(value);
    debouncedFetchImage(value, taxon);
    onChange(
      value || taxon
        ? {
            type: 'lock',
            id: initialCondition?.id || `lock-${Date.now()}`,
            issuer: value,
            taxon,
            nftCount: initialCondition?.nftCount || 1,
            nftImageUrl,
          }
        : null
    );
  };

  const handleTaxonChange = (value: string) => {
    console.log(`Taxon changed to: ${value}`);
    setTaxon(value);
    debouncedFetchImage(issuer, value);
    onChange(
      issuer || value
        ? {
            type: 'lock',
            id: initialCondition?.id || `lock-${Date.now()}`,
            issuer,
            taxon: value,
            nftCount: initialCondition?.nftCount || 1,
            nftImageUrl,
          }
        : null
    );
  };

  const handleRemove = () => {
    setIssuer('');
    setTaxon('');
    setNftImageUrl(null);
    setImageError(null);
    setFetchingImage(false);
    onChange(null);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{ width: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {fetchingImage && (
            <Box sx={{ width: 100, height: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'grey.800', borderRadius: 1 }}>
              <CircularProgress size={40} sx={{ color: '#109573' }} />
            </Box>
          )}
          {nftImageUrl && !fetchingImage && !imageError && (
            <img src={nftImageUrl} alt="NFT Preview" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '4px' }} />
          )}
          {imageError && !fetchingImage && (
            <Typography variant="caption" color="error" sx={{ textAlign: 'center' }}>
              {imageError}
            </Typography>
          )}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <TextField
                label="Issuer Address"
                value={issuer}
                onChange={(e) => handleIssuerChange(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Taxon"
                value={taxon}
                onChange={(e) => handleTaxonChange(e.target.value)}
                fullWidth
                margin="normal"
              />
            </Box>
            {(issuer || taxon || nftImageUrl) && (
              <IconButton
                color="error"
                onClick={handleRemove}
                title="Remove NFT"
                sx={{ mt: 2 }}
              >
                <CancelIcon />
              </IconButton>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            The Basic configuration limits the number of NFTs required to 1. To access advanced features like setting higher quantities, a{' '}
            <a href="https://textrp.io" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
              Community Pack NFT
            </a>{' '}
            is required.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};