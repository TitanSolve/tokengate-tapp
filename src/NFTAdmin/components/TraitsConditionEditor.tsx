import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  Chip,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TraitCondition } from '../types';

interface TraitsConditionEditorProps {
  condition: TraitCondition;
  onChange: (updatedCondition: TraitCondition) => void;
}

export const TraitsConditionEditor: React.FC<TraitsConditionEditorProps> = ({
  condition,
  onChange,
}) => {
  const [issuer, setIssuer] = useState(condition.issuer || '');
  const [taxon, setTaxon] = useState(condition.taxon || '');
  const [nftImageUrl, setNftImageUrl] = useState<string | null>(condition.nftImageUrl);
  const [traits, setTraits] = useState<Record<string, string>>(condition.traits || {});
  const [newTraitKey, setNewTraitKey] = useState('');
  const [newTraitValue, setNewTraitValue] = useState('');

  useEffect(() => {
    onChange({
      ...condition,
      issuer,
      taxon,
      nftImageUrl,
      traits,
    });
  }, [issuer, taxon, nftImageUrl, traits, condition, onChange]);

  const handleIssuerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIssuer(e.target.value);
  };

  const handleTaxonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaxon(e.target.value);
  };

  const handleNftImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNftImageUrl(e.target.value || null);
  };

  const handleAddTrait = () => {
    if (newTraitKey.trim() && newTraitValue.trim()) {
      setTraits({
        ...traits,
        [newTraitKey.trim()]: newTraitValue.trim(),
      });
      setNewTraitKey('');
      setNewTraitValue('');
    }
  };

  const handleRemoveTrait = (key: string) => {
    const updatedTraits = { ...traits };
    delete updatedTraits[key];
    setTraits(updatedTraits);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        NFT Traits Requirements
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Require users to own NFTs with specific traits or attributes
      </Typography>

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
          />

          <TextField
            fullWidth
            label="NFT Image URL (Optional)"
            variant="outlined"
            value={nftImageUrl || ''}
            onChange={handleNftImageUrlChange}
            placeholder="Enter an image URL for this NFT"
            margin="normal"
            helperText="URL for an image representing this NFT collection"
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" gutterBottom>
            Required Traits
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Users must own NFTs with all of these traits to access the room
          </Typography>

          <Box sx={{ mb: 3 }}>
            {Object.entries(traits).map(([key, value], index) => (
              <Chip
                key={index}
                label={`${key}: ${value}`}
                onDelete={() => handleRemoveTrait(key)}
                color="primary"
                variant="outlined"
                sx={{ m: 0.5 }}
              />
            ))}
            {Object.keys(traits).length === 0 && (
              <Typography variant="body2" color="textSecondary">
                No traits added yet
              </Typography>
            )}
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={5}>
              <TextField
                fullWidth
                label="Trait Name"
                variant="outlined"
                size="small"
                value={newTraitKey}
                onChange={(e) => setNewTraitKey(e.target.value)}
                placeholder="e.g. Background"
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                fullWidth
                label="Trait Value"
                variant="outlined"
                size="small"
                value={newTraitValue}
                onChange={(e) => setNewTraitValue(e.target.value)}
                placeholder="e.g. Blue"
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddTrait}
                disabled={!newTraitKey.trim() || !newTraitValue.trim()}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              NFT Preview
            </Typography>
            <Card sx={{ width: '100%', maxWidth: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {nftImageUrl ? (
                <CardMedia
                  component="img"
                  sx={{ maxHeight: 150, maxWidth: 150, objectFit: 'contain' }}
                  image={nftImageUrl}
                  alt="NFT Preview"
                />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No image provided
                </Typography>
              )}
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
