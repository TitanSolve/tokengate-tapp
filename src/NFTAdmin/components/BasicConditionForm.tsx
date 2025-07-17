import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  Grid,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { LockCondition } from '../types';
import { fetchNFTImageUrl } from '../services/nftImageService';
import debounce from 'lodash.debounce';
import API_URLS from '@/config';

interface BasicConditionFormProps {
  condition: LockCondition;
  onChange: (updatedCondition: LockCondition) => void;
}

export const BasicConditionForm: React.FC<BasicConditionFormProps> = ({
  condition,
  onChange,
}) => {
  const [issuer, setIssuer] = useState(condition.issuer || '');
  const [taxon, setTaxon] = useState(condition.taxon || '');
  const [nftCount, setNftCount] = useState(condition.nftCount || 1);
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(condition.nftImageUrl);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Effect to update parent component when values change
  useEffect(() => {
    // Only update if something actually changed
    const hasChanged =
      issuer !== condition.issuer ||
      taxon !== condition.taxon ||
      nftCount !== condition.nftCount ||
      nftImageUrl !== condition.nftImageUrl;
    
    let conditionBasic = condition as LockCondition;
    conditionBasic.type = 'lock';

    if (hasChanged) {
      onChange({
        ...conditionBasic,
        issuer,
        taxon,
        nftCount,
        nftImageUrl,
      });
    }
  }, [issuer, taxon, nftCount, nftImageUrl]);

  // Define the callback type for better type safety
  type ImageFetchCallback = (imageUrl: string | null, error: string | null) => void;

  // Create a debounced version of the image fetching function that can be cancelled
  const debouncedFetchWithCancel = useCallback(() => {
    // Create the debounced function instance
    const debouncedFn = debounce(async (
      issuerValue: string,
      taxonValue: string,
      callback: ImageFetchCallback
    ) => {
      if (!issuerValue || !taxonValue) {
        callback(null, null);
        return;
      }

      try {
        const imageUrl = await fetchNFTImageUrl(issuerValue, taxonValue);
        console.log(`Fetched image URL for ${issuerValue}:${taxonValue} - ${imageUrl}`);
        callback(imageUrl, null);
      } catch (error) {
        console.error('Failed to fetch NFT image:', error);
        callback(null, 'Failed to fetch NFT image');
      }
    }, 10000); // 500ms debounce delay

    // Add the cancel method that we'll use in cleanup
    return {
      fetch: debouncedFn,
      cancel: debouncedFn.cancel
    };
  }, []);

  // Create a reference to the debounced function to ensure we always have the latest version
  const debouncedFnRef = useRef(debouncedFetchWithCancel());

  // Update the reference when the dependency changes
  useEffect(() => {
    debouncedFnRef.current = debouncedFetchWithCancel();
  }, [debouncedFetchWithCancel]);

  // Wrapper function that uses the debounced function but handles the UI state
  const debouncedFetchImage = useCallback(
    (issuerValue: string, taxonValue: string) => {
      // Early return if no values
      if (!issuerValue || !taxonValue) {
        setNftImageUrl(null);
        setImageError(null);
        return;
      }

      setIsLoadingImage(true);
      setImageError(null);

      // Use the debounced function from our ref
      debouncedFnRef.current.fetch(issuerValue, taxonValue, (imageUrl: string | null, error: string | null) => {
        if (imageUrl) {
          setNftImageUrl(imageUrl);
        } else {
          setNftImageUrl(null);
          if (error) {
            setImageError(error);
          } else {
            setImageError('No image found for this NFT');
          }
        }
        setIsLoadingImage(false);
      });
    },
    [setNftImageUrl, setIsLoadingImage, setImageError]
  );

  // Effect to automatically fetch NFT image when issuer and taxon are present
  useEffect(() => {
    // Don't fetch if issuer or taxon is missing
    if (!issuer || !taxon) {
      setNftImageUrl(null);
      setImageError(null);
      return;
    }

    // Use the debounced fetch function to reduce API calls during typing
    debouncedFetchImage(issuer, taxon);

    // Clean up function to cancel any pending debounced operations when dependencies change
    return () => {
      debouncedFnRef.current.cancel();
    };
  }, [issuer, taxon, debouncedFetchImage]);

  const handleIssuerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIssuer(e.target.value);
  };

  const handleTaxonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaxon(e.target.value);
  };

  const handleNftCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNftCount(isNaN(value) ? 1 : Math.max(1, value));
  };

  // Direct test function to diagnose API connectivity issues
  const testDirectAPICall = async () => {
    if (!issuer || !taxon) {
      setImageError('Please enter issuer and taxon first');
      return;
    }

    setIsLoadingImage(true);
    setImageError(null);

    try {
      // Use local proxy to avoid CORS issues
      const apiUrl = API_URLS.backendUrl //''; // Empty base URL will use the current origin with the proxy path
      const apiKey = API_URLS.accesstoken || '';
      const requestBody = {
        issuer: encodeURIComponent(issuer),
        taxon: encodeURIComponent(taxon),
      };
      const url = `${apiUrl}/api/nfts/image-only`;

      // Make a fetch request directly
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.imageUrl) {
        throw new Error('No image URL in response');
      }

      setNftImageUrl(data.imageUrl);
      setImageError(null);
    } catch (error) {
      console.error('🔍 DIRECT TEST: Error:', error);
      setImageError(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setNftImageUrl(null);
    } finally {
      setIsLoadingImage(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        Basic NFT Requirement
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Require users to own a specific NFT to access the room
      </Typography>

      {/* Test button to diagnose API issues */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={testDirectAPICall}
          disabled={isLoadingImage || !issuer || !taxon}
          sx={{ mb: 1 }}
        >
          Test Direct API Call
        </Button>
        <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
          Click to diagnose API connectivity issues
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Issuer Address"
            variant="outlined"
            value={issuer}
            onChange={handleIssuerChange}
            placeholder="Enter the NFT issuer address"
            margin="normal"
            helperText="The account that issued the NFT collection"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.light',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
              },
              '& .MuiFormHelperText-root': {
                fontSize: '0.75rem',
                marginTop: 0.5
              }
            }}
          />

          <TextField
            fullWidth
            label="Taxon"
            variant="outlined"
            value={taxon}
            onChange={handleTaxonChange}
            placeholder="Enter the NFT taxon"
            margin="normal"
            helperText="The numeric identifier for the NFT collection"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.light',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
              },
              '& .MuiFormHelperText-root': {
                fontSize: '0.75rem',
                marginTop: 0.5
              }
            }}
          />

          <TextField
            fullWidth
            label="Required Number of NFTs"
            variant="outlined"
            type="number"
            value={nftCount}
            onChange={handleNftCountChange}
            InputProps={{
              inputProps: { min: 1 },
              startAdornment: <InputAdornment position="start">#</InputAdornment>,
            }}
            margin="normal"
            helperText="How many of these NFTs must a user own"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.light',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
              },
              '& .MuiFormHelperText-root': {
                fontSize: '0.75rem',
                marginTop: 0.5
              }
            }}
          />

          {/* NFT image is now fetched automatically based on issuer and taxon */}
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              NFT Image Preview
            </Typography>

            {isLoadingImage ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, width: 200, bgcolor: 'rgba(0,0,0,0.04)' }}>
                <CircularProgress size={40} />
              </Box>
            ) : nftImageUrl ? (
              <Card sx={{ maxWidth: 200 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={nftImageUrl}
                  alt="NFT Preview"
                  sx={{ objectFit: 'contain' }}
                />
              </Card>
            ) : (
              <Box
                sx={{
                  height: 200,
                  width: 200,
                  bgcolor: 'rgba(0,0,0,0.04)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px dashed rgba(0,0,0,0.2)',
                  flexDirection: 'column',
                  padding: 2
                }}
              >
                {imageError ? (
                  <Alert severity="error" sx={{ fontSize: '0.75rem', mb: 1, width: '100%' }}>
                    {imageError}
                  </Alert>
                ) : null}
                <Typography variant="body2" color="textSecondary" align="center">
                  {issuer && taxon ? 'No image available' : 'Enter issuer and taxon'}
                </Typography>
              </Box>
            )}

            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
              Auto-fetching image based on issuer/taxon
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
