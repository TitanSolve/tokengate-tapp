// example-widget-mui/src/NFTAdmin/components/TraitsConditionEditor.tsx

import { useState, useEffect, useCallback } from 'react';
import { Box, TextField, Typography, CircularProgress, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { ConditionTree, TraitCondition } from '../types';
import debounce from 'lodash.debounce';

interface TraitsConditionEditorProps {
  onChange: (newTree: ConditionTree | null) => void;
  initialCondition: TraitCondition | null;
}

// Helper function to extract all traits from metadata array (mirrors backend extractTraitsFromMetadata)
const extractAllTraits = (metadata: any[]): Record<string, string[]> => {
  const allTraits: Record<string, Set<string>> = {};

  for (const metadataItem of metadata) {
    const attributes = metadataItem.attributes || metadataItem.properties || metadataItem.traits || metadataItem.attrs || [];
    for (const attr of attributes) {
      const traitKey = attr.trait_type || attr.key || attr.name || attr.category;
      const traitValue = String(attr.value);
      if (traitKey && traitValue !== 'undefined') {
        if (!allTraits[traitKey]) {
          allTraits[traitKey] = new Set();
        }
        allTraits[traitKey].add(traitValue);
      }
    }
  }

  const result: Record<string, string[]> = {};
  for (const traitKey in allTraits) {
    result[traitKey] = Array.from(allTraits[traitKey]);
  }
  return result;
};

export const TraitsConditionEditor = ({ onChange, initialCondition }: TraitsConditionEditorProps) => {
  const [issuer, setIssuer] = useState(initialCondition?.issuer || '');
  const [taxon, setTaxon] = useState(initialCondition?.taxon || '');
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(initialCondition?.nftImageUrl || null);
  const [traits, setTraits] = useState<Record<string, string>>(initialCondition?.traits || {});
  const [availableTraits, setAvailableTraits] = useState<Record<string, string[]>>({});
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = 'https://15c32806-20be-45c8-b3ea-1f0a3e72dfb5-00-2ojqtwmdtbb4m.kirk.replit.dev';

  const fetchTraits = useCallback(
    async (fetchIssuer: string, fetchTaxon: string) => {
      if (!fetchIssuer || !fetchTaxon) {
        console.log('No issuer or taxon provided, skipping fetch');
        setAvailableTraits({});
        setNftImageUrl(null);
        setError(null);
        return;
      }

      if (!fetchIssuer.match(/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/)) {
        console.error(`Invalid issuer format: ${fetchIssuer}`);
        setError('Invalid issuer address');
        setAvailableTraits({});
        setNftImageUrl(null);
        return;
      }

      console.log(`Fetching traits with issuer: ${fetchIssuer}, taxon: ${fetchTaxon}`);
      setFetching(true);
      setError(null);
      try {
        const url = `${apiUrl}/api/nfts/image?issuer=${encodeURIComponent(fetchIssuer)}&taxon=${encodeURIComponent(fetchTaxon)}`;
        console.log(`Sending request to: ${url}`);
        const response = await fetch(url, { headers: { Authorization: 'Bearer 1234567890QWERTYUIOP' } });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        console.log('Traits API response:', data);

        const metadataTraits = data.metadata && data.metadata.length > 0 ? extractAllTraits(data.metadata) : {};
        console.log('Extracted available traits:', metadataTraits);

        setAvailableTraits(metadataTraits);
        setNftImageUrl(data.imageUrl || null);
        onChange({
          type: 'trait',
          id: initialCondition?.id || `trait-${Date.now()}`,
          issuer: fetchIssuer,
          taxon: fetchTaxon,
          nftImageUrl: data.imageUrl || null,
          traits,
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load data for this collection');
        setAvailableTraits({});
        setNftImageUrl(null);
        onChange({
          type: 'trait',
          id: initialCondition?.id || `trait-${Date.now()}`,
          issuer: fetchIssuer,
          taxon: fetchTaxon,
          nftImageUrl: null,
          traits,
        });
      } finally {
        setFetching(false);
      }
    },
    [onChange, traits, initialCondition?.id]
  );

  const debouncedFetchTraits = useCallback(debounce(fetchTraits, 1000), [fetchTraits]);

  // Sync local state with initialCondition when it changes
  useEffect(() => {
    if (initialCondition) {
      setIssuer(initialCondition.issuer || '');
      setTaxon(initialCondition.taxon || '');
      setTraits(initialCondition.traits || {});
      setNftImageUrl(initialCondition.nftImageUrl || null);
    }
  }, [initialCondition]);

  // Fetch traits only when issuer or taxon changes
  useEffect(() => {
    if (issuer && taxon) {
      console.log(`Triggering fetchTraits with issuer: ${issuer}, taxon: ${taxon}`);
      debouncedFetchTraits(issuer, taxon);
    }
  }, [issuer, taxon, debouncedFetchTraits]);

  const handleIssuerChange = (value: string) => {
    console.log(`Issuer changed to: ${value}`);
    setIssuer(value);
    setTraits({});
    setAvailableTraits({});
    setNftImageUrl(null);
    setError(null);
    onChange({
      type: 'trait',
      id: initialCondition?.id || `trait-${Date.now()}`,
      issuer: value,
      taxon,
      nftImageUrl: null,
      traits: {},
    });
  };

  const handleTaxonChange = (value: string) => {
    console.log(`Taxon changed to: ${value}`);
    setTaxon(value);
    setTraits({});
    setAvailableTraits({});
    setNftImageUrl(null);
    setError(null);
    onChange({
      type: 'trait',
      id: initialCondition?.id || `trait-${Date.now()}`,
      issuer,
      taxon: value,
      nftImageUrl: null,
      traits: {},
    });
  };

  const handleTraitChange = (traitKey: string, value: string) => {
    const updatedTraits = { ...traits, [traitKey]: value };
    setTraits(updatedTraits);
    onChange({
      type: 'trait',
      id: initialCondition?.id || `trait-${Date.now()}`,
      issuer,
      taxon,
      nftImageUrl,
      traits: updatedTraits,
    });
  };

  const handleRemove = () => {
    setIssuer('');
    setTaxon('');
    setTraits({});
    setNftImageUrl(null);
    setError(null);
    setFetching(false);
    onChange({
      type: 'trait',
      id: initialCondition?.id || `trait-${Date.now()}`,
      issuer: '',
      taxon: '',
      nftImageUrl: null,
      traits: {},
    });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{ width: 100, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {fetching && <CircularProgress />}
          {nftImageUrl && !fetching && <img src={nftImageUrl} alt="NFT Preview" style={{ maxWidth: '100px' }} />}
          {error && !fetching && <Typography color="error">{error}</Typography>}
          {!fetching && !nftImageUrl && !error && issuer && taxon && (
            <Typography variant="body2" color="text.secondary">No image available</Typography>
          )}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <TextField label="Issuer Address" value={issuer} onChange={(e) => handleIssuerChange(e.target.value)} fullWidth margin="normal" />
              <TextField label="Taxon" value={taxon} onChange={(e) => handleTaxonChange(e.target.value)} fullWidth margin="normal" />
            </Box>
            {(issuer || taxon || Object.keys(traits).length > 0) && (
              <IconButton color="error" onClick={handleRemove}><CancelIcon /></IconButton>
            )}
          </Box>
          {Object.keys(availableTraits).length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">Select Traits:</Typography>
              {Object.entries(availableTraits).map(([traitKey, values]) => (
                <FormControl fullWidth margin="normal" key={traitKey}>
                  <InputLabel>{traitKey}</InputLabel>
                  <Select
                    value={traits[traitKey] || ''}
                    onChange={(e) => handleTraitChange(traitKey, e.target.value as string)}
                    label={traitKey}
                  >
                    <MenuItem value="">None</MenuItem>
                    {values.map((value) => (
                      <MenuItem key={value} value={value}>{value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Box>
          ) : (
            !fetching && !error && issuer && taxon && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No traits available for this collection, but you can still save this condition with the image.
              </Typography>
            )
          )}
        </Box>
      </Box>
    </Box>
  );
};