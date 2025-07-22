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
  Avatar,
  Stack, ClickAwayListener, Paper, Grow, Popper, MenuList, MenuItem, Divider, useMediaQuery
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import { useTheme } from '@mui/material/styles';
import { LockCondition } from '../types';
import { fetchNFTImageUrl } from '../services/nftImageService';
import debounce from 'lodash.debounce';
import API_URLS from '@/config';

interface BasicConditionFormProps {
  userId: string | null;
  condition: LockCondition;
  onChange: (updatedCondition: LockCondition) => void;
}

type GroupedNFTs = Record<string, { nfts: any[] }>;

export const BasicConditionForm: React.FC<BasicConditionFormProps> = ({
  userId,
  condition,
  onChange,
}) => {
  const [issuer, setIssuer] = useState(condition.issuer || '');
  const [taxon, setTaxon] = useState(condition.taxon || '');
  const [nftCount, setNftCount] = useState(condition.nftCount || 1);
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(condition.nftImageUrl);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [NFTs, setNFTs] = useState<GroupedNFTs>({});
  const [loading, setLoading] = useState<boolean>(true);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const collectionKeys = Object.keys(NFTs);
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(collectionKeys.length > 0 ? collectionKeys[0] : '');
  const anchorRef = React.useRef(null);
  const [minCount, setMinCount] = useState(1);

  const handleToggle = () => {
    // if (e?.target?.tagName.toLowerCase() === 'input' || e?.target?.tagName.toLowerCase() === 'textarea') return;
    setOpen((prevOpen) => !prevOpen);
  };

  const handleSelect = (key: string) => {
    setSelectedKey(key);
    setOpen(false);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  const selectedCollection = NFTs[selectedKey];
  const selected = selectedCollection?.nfts?.[0];

  useEffect(() => {
    const fetchNFT = async () => {
      console.log('Fetching NFTs for userId:', userId);
      const tmpUsrId = userId || "";
      const xrplAccount = tmpUsrId.split("@")[1]?.split(":")[0];
      console.log('Fetching NFTs for XRPL account:', xrplAccount);
      console.log('bithompToken:', API_URLS.bithompToken);
      try {
        const response = await fetch(
          // `${API_URLS.marketPlace}/api/v2/nfts?owner=${xrplAccount}&assets=true`, //?assets=true`,
          `${API_URLS.marketPlace}/api/v2/nfts?owner=r34VdeAwi8qs1KF3DTn5T3Y5UAPmbBNWpX&assets=true`, //?assets=true`,
          {
            method: "GET",
            headers: {
              "x-bithomp-token": API_URLS.bithompToken || "",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch NFT data");
        }

        const data = await response.json();
        console.log('NFT data fetched:', data);
        const rawNFTs: any[] = data.nfts || [];

        const grouped: GroupedNFTs = {};

        for (const nft of rawNFTs) {
          const imageURI =
            nft?.metadata?.image
              ?.replace("ipfs://", "https://ipfs.io/ipfs/")
              .replace("#", "%23") || "";

          const key = `${nft?.issuer}_${nft?.nftokenTaxon}`;

          if (!grouped[key]) {
            grouped[key] = { nfts: [] };
          }

          grouped[key].nfts.push({
            ...nft,
            imageURI,
            ownerUsername: nft?.ownerDetails?.username || null,
            collectionName: nft?.collection || null,
          });
        }

        setNFTs(grouped);
        console.log("Grouped NFTs:", grouped);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(`Error fetching NFTs for ${userId}:`, err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNFT();
    setIssuer('1');
    setTaxon('0');
    console.log('NFTs fetched:', NFTs);
    console.log(loading);
  }, [userId]);

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

  const handleNftCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNftCount(isNaN(value) ? 1 : Math.max(1, value));
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        Basic NFT Requirement
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Require users to own a specific NFT to access the room
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box p={2} maxWidth={480} mx="auto" textAlign="center">
            <ClickAwayListener onClickAway={handleClickAway}>
              <Box p={2} maxWidth={480} mx="auto" textAlign="center">
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  Set Tokengate Role
                </Typography>
                <ClickAwayListener onClickAway={handleClickAway}>
                  <Box position="relative">
                    <Stack
                      direction="column"
                      alignItems="center"
                      spacing={2}
                      border={1}
                      borderRadius={3}
                      p={2}
                      sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
                      onClick={handleToggle}
                      ref={anchorRef}
                    >
                      {selected ? (
                        <>
                          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                            <Avatar
                              variant="rounded"
                              src={selected.imageURI}
                              alt={selected.metadata.name}
                              sx={{ width: 64, height: 64 }}
                            />
                            <Box textAlign="left">
                              <Typography fontWeight="bold">{selected.metadata.name}</Typography>
                              {!isSmallScreen && (
                                <Typography variant="body2" color="text.secondary">
                                  {selected.issuer} / Taxon {selected.nftokenTaxon}
                                </Typography>
                              )}
                            </Box>
                            <ArrowDropDownIcon fontSize="large" />
                          </Stack>

                          <Divider flexItem sx={{ width: '100%', mt: 1, mb: 1 }} />

                          <Grid container spacing={2} justifyContent="center">
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Issuer:</strong>
                              </Typography>
                              <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>{selected.issuer}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Taxon:</strong>
                              </Typography>
                              <Typography variant="caption">{selected.nftokenTaxon}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                label="Minimum NFT Count"
                                type="number"
                                value={nftCount}
                                onChange={handleNftCountChange}
                                fullWidth
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <FormatListNumberedIcon />
                                    </InputAdornment>
                                  ),
                                  inputProps: { min: 1 }
                                }}
                                sx={{ borderRadius: 2, backgroundColor: '#fafafa' }}
                              />
                            </Grid>
                          </Grid>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No collections available.
                        </Typography>
                      )}
                    </Stack>

                    {collectionKeys.length > 0 && (
                      <Popper open={open} anchorEl={anchorRef.current} placement="bottom" transition disablePortal modifiers={[{ name: 'offset', options: { offset: [0, 12] } }]}
                        style={{ zIndex: 1300, width: '100%' }}>
                        {({ TransitionProps }) => (
                          <Grow {...TransitionProps}>
                            <Paper sx={{ mt: 2, borderRadius: 3, overflow: 'hidden', maxHeight: 320, overflowY: 'auto' }}>
                              <MenuList autoFocusItem={open}>
                                {collectionKeys.map((key) => {
                                  const nft = NFTs[key].nfts?.[0];
                                  const isSelected = key === selectedKey;
                                  return nft ? (
                                    <MenuItem
                                      key={key}
                                      onClick={() => handleSelect(key)}
                                      selected={isSelected}
                                      sx={{ p: 1.5, borderBottom: '1px solid #eee', '&:hover': { backgroundColor: '#f5f5f5' } }}
                                    >
                                      <Stack direction="row" spacing={2} alignItems="center" width="100%">
                                        <Avatar variant="rounded" src={nft.imageURI} sx={{ width: 60, height: 60 }} />
                                        <Box flexGrow={1}>
                                          <Typography fontWeight="600">{nft.metadata?.name || 'NFT'}</Typography>
                                          {!isSmallScreen && (
                                            <Typography variant="caption" color="text.secondary">
                                              {nft.issuer} / Taxon {nft.nftokenTaxon}
                                            </Typography>
                                          )}
                                        </Box>
                                      </Stack>
                                    </MenuItem>
                                  ) : null;
                                })}
                              </MenuList>
                            </Paper>
                          </Grow>
                        )}
                      </Popper>
                    )}
                  </Box>
                </ClickAwayListener>
              </Box>
            </ClickAwayListener>
          </Box>

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
