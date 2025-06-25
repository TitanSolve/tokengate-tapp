// example-widget-mui/src/NFTAdmin/components/LockConditionDisplayEdit.tsx

import { useState, useEffect, useCallback } from 'react';
import { TextField, Box, CircularProgress, IconButton, Typography } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { LockCondition, ConditionTree } from '../types';
import { imageCache, saveCacheToStorage } from '../cache';
import debounce from 'lodash.debounce';

interface LockConditionDisplayEditProps {
  condition: LockCondition;
  onChange: (newCondition: ConditionTree) => void;
  onRemove: () => void;
}

export const LockConditionDisplayEdit = ({ condition, onChange, onRemove }: LockConditionDisplayEditProps) => {
  const [issuer, setIssuer] = useState(condition.issuer || '');
  const [taxon, setTaxon] = useState(condition.taxon || '');
  const [nftCount, setNftCount] = useState(condition.nftCount || 1);
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(condition.nftImageUrl || null);
  const [fetchingImage, setFetchingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const apiUrl = 'https://15c32806-20be-45c8-b3ea-1f0a3e72dfb5-00-2ojqtwmdtbb4m.kirk.replit.dev';

  // Sync local state with condition prop when it changes
  useEffect(() => {
    setIssuer(condition.issuer || '');
    setTaxon(condition.taxon || '');
    setNftCount(condition.nftCount || 1);
    setNftImageUrl(condition.nftImageUrl || null);
  }, [condition]);

  const fetchImage = useCallback(
    async (fetchIssuer: string, fetchTaxon: string) => {
      if (!fetchIssuer || !fetchTaxon) {
        setNftImageUrl(null);
        setImageError(null);
        return;
      }
      if (!fetchIssuer.match(/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/)) {
        setImageError('Invalid issuer address');
        setNftImageUrl(null);
        return;
      }

      const cacheKey = `${fetchIssuer}:${fetchTaxon}`;
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
        const url = `${apiUrl}/api/nfts/image-only?issuer=${encodeURIComponent(fetchIssuer)}&taxon=${encodeURIComponent(fetchTaxon)}`;
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

        if (fetchedUrl !== condition.nftImageUrl) {
          onChange({
            ...condition,
            issuer: fetchIssuer,
            taxon: fetchTaxon,
            nftCount,
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
    [condition, nftCount, onChange]
  );

  const debouncedFetchImage = useCallback(debounce(fetchImage, 1000), [fetchImage]);

  // Fetch image whenever issuer and taxon are set
  useEffect(() => {
    if (issuer && taxon) {
      debouncedFetchImage(issuer, taxon);
    }
  }, [issuer, taxon, debouncedFetchImage]);

  const handleIssuerChange = (value: string) => {
    setIssuer(value);
    onChange({ ...condition, issuer: value, taxon, nftCount, nftImageUrl });
  };

  const handleTaxonChange = (value: string) => {
    setTaxon(value);
    onChange({ ...condition, issuer, taxon: value, nftCount, nftImageUrl });
  };

  const handleCountChange = (value: string) => {
    const count = Math.max(1, parseInt(value) || 1);
    setNftCount(count);
    onChange({ ...condition, issuer, taxon, nftCount: count, nftImageUrl });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Box sx={{ width: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {fetchingImage && <CircularProgress />}
        {nftImageUrl && !fetchingImage && !imageError && (
          <img src={nftImageUrl} alt="NFT Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
        )}
        {imageError && !fetchingImage && <Typography color="error">{imageError}</Typography>}
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
            <TextField
              label="NFT Count"
              type="number"
              value={nftCount}
              onChange={(e) => handleCountChange(e.target.value)}
              fullWidth
              margin="normal"
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Box>
          <IconButton color="error" onClick={onRemove}>
            <CancelIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};