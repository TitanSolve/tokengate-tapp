import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  Grid,
  Card,
  CardMedia,
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
  saveChanged: number; // 0: not requested, 1: success, 2: pending
  onChange: (updatedCondition: LockCondition) => void;
}

type GroupedNFTs = Record<string, { nfts: any[] }>;

export const BasicConditionForm: React.FC<BasicConditionFormProps> = ({
  userId,
  condition,
  saveChanged,
  onChange,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadedIssuer, setLoadedIssuer] = useState('');
  const [loadedTaxon, setLoadedTaxon] = useState('');
  const [loadedNftCount, setLoadedNftCount] = useState(1);
  const [loadedNftImageUrl, setLoadedNftImageUrl] = useState<string | null>('');
  const [issuer, setIssuer] = useState('');
  const [taxon, setTaxon] = useState('');
  const [nftCount, setNftCount] = useState(1);
  const [nftImageUrl, setNftImageUrl] = useState<string | null>('');
  const [isSavedChanges, setIsSavedChanges] = useState(0); // 0: not saved, 2: saved, 1: pending
  // const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [NFTs, setNFTs] = useState<GroupedNFTs>({});
  const collectionKeys = Object.keys(NFTs);
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(collectionKeys.length > 0 ? collectionKeys[0] : '');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const anchorRef = React.useRef(null);

  useEffect(() => {
    console.log('saveChanged:', saveChanged);
    setIsSavedChanges(saveChanged);
    if (saveChanged === 2) {  // 1: pending, 2: success
      setLoadedIssuer(condition.issuer || '');
      setLoadedTaxon(condition.taxon || '');
      setLoadedNftCount(condition.nftCount || 1);
      setLoadedNftImageUrl(condition.nftImageUrl || null);
    }
  }, [saveChanged] );

  useEffect(() => {
    if( condition.issuer === '' || condition.taxon === '' ) {
      console.warn('Condition issuer or taxon is empty, skipping initialization');
      return;
    }

    console.log('Condition changed:', condition, isSavedChanges, loadedIssuer, loadedTaxon);
    if (isSavedChanges !== 2 || (loadedIssuer === '' && loadedTaxon === '') ) {
      console.log('initialized');
      setLoadedIssuer(condition.issuer || '');
      setLoadedTaxon(condition.taxon || '');
      setLoadedNftCount(condition.nftCount || 1);
      setLoadedNftImageUrl(condition.nftImageUrl || null);
      setIsInitialized(true);
    }
  }, [condition]);

  const handleToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      e.target instanceof Element &&
      ['input', 'textarea'].includes(e.target.tagName.toLowerCase())
    ) {
      return;
    }
    setOpen(prev => !prev);
  };

  const handleSelect = (key: string) => {
    setSelectedKey(key);
    setOpen(false);

    if (collectionKeys.length > 0) {
      if (NFTs[key] === undefined) {
        console.warn(`NFTs for key ${key} not found.`);
        return;
      }
      const selectedNFT = NFTs[key].nfts?.[0];
      if (selectedNFT) {
        setIssuer(selectedNFT.issuer);
        setTaxon(selectedNFT.nftokenTaxon);
        setNftImageUrl(selectedNFT.imageURI);
      }
    }
  };

  useEffect(() => {
    const keys = Object.keys(NFTs);
    if (keys.length > 0) {
      setSelectedKey(keys[0]);
    }
  }, [NFTs]);

  const handleClickAway = () => {
    setOpen(false);
  };

  const selected = NFTs[selectedKey]?.nfts?.[0];

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
      }
    };

    fetchNFT();
    console.log('NFTs fetched:', NFTs);
  }, [userId]);

  // Effect to update parent component when values change
  useEffect(() => {
    // Only update if something actually changed
    console.log('initialized:', isInitialized);
    if (!isInitialized) {
      console.log('Component not initialized yet, skipping update');
      return;
    }

    console.log('Updating parent component with new values:', issuer, taxon, nftCount, nftImageUrl, loadedNftCount, condition.nftCount);

    //--------edit this part to avoid empty updates--------
    if ((issuer === '' && taxon === '' && nftCount === 1 && (nftImageUrl === '' || nftImageUrl === null)) &&
      (loadedNftCount === condition.nftCount)) {
      console.log('No changes detected, skipping update');
      return;
    }

    const hasChanged =
      issuer !== condition.issuer ||
      taxon !== condition.taxon ||
      nftCount !== condition.nftCount ||
      nftImageUrl !== condition.nftImageUrl ||
      loadedNftCount !== condition.nftCount;

    let conditionBasic = condition as LockCondition;
    conditionBasic.type = 'lock';

    let changedIssuer = issuer || '';
    let changedTaxon = taxon || '';
    let changedNftCount = nftCount || 1;
    let changedNftImageUrl = nftImageUrl || null;

    if (changedIssuer === '' && changedTaxon === '') {
      changedIssuer = conditionBasic.issuer || '';
      changedTaxon = conditionBasic.taxon || '';
      changedNftCount = loadedNftCount || 1;
      changedNftImageUrl = conditionBasic.nftImageUrl || null;
    }


    if (hasChanged) {
      console.log('-----------conditionBasic changed---------------');
      onChange({
        ...conditionBasic,
        issuer: changedIssuer,
        taxon: changedTaxon,
        nftCount: changedNftCount,
        nftImageUrl: changedNftImageUrl,
      });
    }
  }, [issuer, taxon, nftCount, nftImageUrl/*, loadedNftCount*/]);

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

      // setIsLoadingImage(true);
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
        // setIsLoadingImage(false);
      });
    },
    [setNftImageUrl, /*setIsLoadingImage,*/ setImageError]
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

  // const handleLoadedNftCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = parseInt(e.target.value, 10);
  //   setLoadedNftCount(isNaN(value) ? 1 : Math.max(1, value));
  // };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} sx={{ cursor: 'pointer' }} >
          <Box p={2} maxWidth={480} mx="auto" textAlign="center">
            <ClickAwayListener onClickAway={handleClickAway}>
              <Box p={2} maxWidth={480} mx="auto" textAlign="center">
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  Set New Tokengate Role
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
                      sx={{ bgcolor: 'background.paper', boxShadow: 2, cursor: 'pointer' }}
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
                              sx={{ borderRadius: 2, marginTop: 4 }}
                            />
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
                            <Paper sx={{ mt: 1, borderRadius: 3, overflow: 'hidden', maxHeight: 320, overflowY: 'auto' }}>
                              <MenuList autoFocusItem={open}>
                                {collectionKeys.map((key) => {
                                  const nft = NFTs[key].nfts?.[0];
                                  const isSelected = key === selectedKey;
                                  return nft ? (
                                    <MenuItem
                                      key={key}
                                      onClick={() => handleSelect(key)}
                                      selected={isSelected}
                                      sx={{ p: 1.5, borderBottom: '1px solid #eee' }}
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
        </Grid>

        <Divider flexItem sx={{ width: '100%', mt: 2, mb: 2 }} />

        <Box p={2} maxWidth={480} mx="auto" textAlign="center">
          <Box p={2} maxWidth={480} mx="auto" textAlign="center">
            <Typography variant="h6" fontWeight="bold" mb={1}>
              Current Tokengate Role
            </Typography>
            <Box position="relative">
              <Stack
                direction="column"
                alignItems="center"
                spacing={2}
                border={1}
                borderRadius={3}
                p={2}
                sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
              >
                {loadedIssuer !== '' || loadedTaxon !== '' ? (
                  <>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                      {loadedNftImageUrl ? (
                        <Card sx={{ maxWidth: 128 }}>
                          <CardMedia
                            component="img"
                            height="128"
                            image={loadedNftImageUrl}
                            alt="NFT Preview"
                            sx={{ objectFit: 'contain' }}
                          />
                        </Card>
                      ) : (
                        <Box
                          sx={{
                            height: 128,
                            width: 128,
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
                            No image available.
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    <Divider flexItem sx={{ width: '100%', ml: 1, mt: 1, mb: 1 }} />

                    <Grid container spacing={3} justifyContent="center">
                      <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>Issuer: {loadedIssuer}</Typography>
                      <Typography variant="caption">Taxon: {loadedTaxon}</Typography>
                    </Grid>
                    <Typography variant="caption">Count: {loadedNftCount}</Typography>
                    {/* <TextField
                      label="Minimum NFT Count"
                      type="number"
                      value={loadedNftCount}
                      onChange={handleLoadedNftCountChange}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FormatListNumberedIcon />
                          </InputAdornment>
                        ),
                        inputProps: { min: 1 }
                      }}
                      sx={{ borderRadius: 2, marginTop: 4 }}
                    /> */}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Role is not set. Please set a role.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};
