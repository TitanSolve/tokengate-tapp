import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Chip,
} from '@mui/material';
import { ConditionTree, LockCondition, TraitCondition } from '../types';

interface LockConditionCardProps {
  condition: ConditionTree;
}

export const LockConditionCard: React.FC<LockConditionCardProps> = ({
  condition,
}) => {
  const renderConditionContent = () => {
    if (condition.type === 'lock') {
      const { issuer, taxon, nftCount, nftImageUrl } = condition as LockCondition;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {nftImageUrl && (
            <Box sx={{ mr: 2 }}>
              <Card sx={{ width: 80, height: 80 }}>
                <CardMedia
                  component="img"
                  sx={{ height: '100%', objectFit: 'contain' }}
                  image={nftImageUrl}
                  alt="NFT"
                />
              </Card>
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2">
              {issuer ? shortenAddress(issuer) : 'No issuer set'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Taxon: {taxon || 'Not set'}
            </Typography>
            <Chip
              label={`${nftCount || 1} required`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
      );
    } else if (condition.type === 'trait') {
      const { issuer, taxon, traits, nftImageUrl } = condition as TraitCondition;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {nftImageUrl && (
            <Box sx={{ mr: 2 }}>
              <Card sx={{ width: 80, height: 80 }}>
                <CardMedia
                  component="img"
                  sx={{ height: '100%', objectFit: 'contain' }}
                  image={nftImageUrl}
                  alt="NFT"
                />
              </Card>
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2">
              {issuer ? shortenAddress(issuer) : 'No issuer set'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Taxon: {taxon || 'Not set'}
            </Typography>
            <Box sx={{ mt: 1 }}>
              {Object.entries(traits).map(([key, value], index) => (
                <Chip
                  key={index}
                  label={`${key}: ${value}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
              {Object.keys(traits).length === 0 && (
                <Typography variant="caption" color="textSecondary">
                  No traits specified
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      );
    }
    
    return (
      <Typography variant="body2" color="error">
        Unknown condition type
      </Typography>
    );
  };

  const shortenAddress = (address: string) => {
    return address.length > 10
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : address;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {renderConditionContent()}
    </Box>
  );
};
