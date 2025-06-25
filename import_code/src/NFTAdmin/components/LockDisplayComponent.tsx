// /NFTAdmin/components/LockDisplayComponent.tsx
import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material'; // Removed unused Button
import { ConditionTree, LockGroup } from '../types';
import { imageCache, saveCacheToStorage } from '../cache';

interface LockDisplayComponentProps {
  tree: ConditionTree;
  keyPrefix: string;
}

export const LockDisplayComponent = ({ tree, keyPrefix }: LockDisplayComponentProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [fetchingImage, setFetchingImage] = useState(false);
  const imageUrl = tree.type === 'lock' ? tree.nftImageUrl : undefined;
  const apiUrl = 'https://15c32806-20be-45c8-b3ea-1f0a3e72dfb5-00-2ojqtwmdtbb4m.kirk.replit.dev';

  useEffect(() => {
    setImageLoaded(false);
    setImageError(null);
    setFetchingImage(false);

    if (tree.type !== 'lock') return;

    const cacheKey = `${tree.issuer}:${tree.taxon}`;
    const cachedEntry = imageCache.get(cacheKey);

    if (cachedEntry) {
      tree.nftImageUrl = cachedEntry.nftImageUrl;
      const img = new Image();
      img.src = encodeURI(cachedEntry.nftImageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')).replace(/#/g, '%23');
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError('Failed to load NFT image from cache');
    } else if (imageUrl) {
      const img = new Image();
      img.src = encodeURI(imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')).replace(/#/g, '%23');
      img.onload = () => {
        setImageLoaded(true);
        imageCache.set(cacheKey, { nftImageUrl: imageUrl });
        saveCacheToStorage();
      };
      img.onerror = () => setImageError('Failed to load NFT image');
    } else if (tree.issuer && tree.taxon) {
      const fetchImage = async () => {
        setFetchingImage(true);
        try {
          const response = await fetch(
            `${apiUrl}/api/nfts/image?issuer=${encodeURIComponent(tree.issuer)}&taxon=${encodeURIComponent(tree.taxon)}`,
            { headers: { Authorization: 'Bearer 1234567890QWERTYUIOP' } }
          );
          if (!response.ok) throw new Error('Failed to fetch NFT image');
          const data = await response.json();
          tree.nftImageUrl = data.imageUrl;
          imageCache.set(cacheKey, { nftImageUrl: data.imageUrl });
          saveCacheToStorage();
          const img = new Image();
          img.src = encodeURI(data.imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')).replace(/#/g, '%23');
          img.onload = () => setImageLoaded(true);
          img.onerror = () => setImageError('Failed to load NFT image');
        } catch (error) {
          setImageError('Failed to fetch NFT image');
        } finally {
          setFetchingImage(false);
        }
      };
      fetchImage();
    }
  }, [imageUrl, tree]);

  if (tree.type === 'lock') {
    const hasValidInputs = tree.issuer && tree.taxon && tree.nftCount > 0;
    return (
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, py: 1 }}>
        {(fetchingImage || (!imageLoaded && !imageUrl && hasValidInputs)) && !imageError && (
          <Box sx={{ width: 100, height: 100, display: 'flex', justifyContent: 'center', bgcolor: 'grey.800', borderRadius: 1 }}>
            <CircularProgress size={40} sx={{ color: '#109573' }} />
          </Box>
        )}
        {(imageUrl || imageError) && (
          <Box
            component="img"
            src={
              imageError || !imageUrl
                ? '/no-image.png'
                : encodeURI(imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')).replace(/#/g, '%23')
            }
            alt={`NFT ${tree.taxon}`}
            sx={{
              width: 100,
              height: 100,
              objectFit: 'cover',
              borderRadius: 1,
              display: imageLoaded || imageError ? 'block' : 'none',
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError('Failed to load NFT image')}
          />
        )}
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#109573' }}>Issuer Address</Typography>
          <Box sx={{ borderBottom: '2px #109573', my: 0.5 }} />
          <Typography variant="body2" sx={{ color: '#FFFFFF' }}>{tree.issuer || 'Not set'}</Typography>
          <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
            Taxon: {tree.taxon || 'Not set'}, NFTs Required: {tree.nftCount}
          </Typography>
        </Box>
        {imageError && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {imageError}
          </Alert>
        )}
      </Box>
    );
  } else if (tree.type === 'group') {
    const group = tree as LockGroup; // Type assertion after narrowing
    return (
      <Box sx={{ p: 1, m: 1, border: '2px dashed #109573', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#109573', mb: 1 }}>{group.operator}</Typography>
        <Box sx={{ ml: 2 }}>
          {group.children.map((child: ConditionTree, index: number) => (
            <Box key={`${keyPrefix}-child-${index}`}>
              <LockDisplayComponent tree={child} keyPrefix={`${keyPrefix}-child-${index}`} />
              {index < group.children.length - 1 && (
                <Typography variant="body2" sx={{ color: '#109573', my: 1 }}>{group.operator}</Typography>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    );
  } else {
    // Handle TraitCondition case (minimal display since it's not the focus)
    return (
      <Box sx={{ p: 1, m: 1, border: '1px solid grey', borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ color: '#FFFFFF' }}>Trait Condition</Typography>
        <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
          Issuer: {tree.issuer || 'Not set'}, Taxon: {tree.taxon || 'Not set'}
        </Typography>
      </Box>
    );
  }
};