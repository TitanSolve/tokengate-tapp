import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ConditionTree, LockCondition, LockGroup, TraitCondition } from '../types';

interface LockDisplayComponentProps {
  tree: ConditionTree;
}

export const LockDisplayComponent: React.FC<LockDisplayComponentProps> = ({ tree }) => {
  const renderLockCondition = (condition: LockCondition) => {
    const shortenAddress = (address: string) => {
      return address.length > 8
        ? `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
        : address;
    };

    return (
      <Box>
        <Typography variant="body2">
          {condition.nftCount || 1} NFT{condition.nftCount !== 1 ? 's' : ''} from{' '}
          <strong>{shortenAddress(condition.issuer)}</strong> with taxon <strong>{condition.taxon}</strong>
        </Typography>
      </Box>
    );
  };

  const renderTraitCondition = (condition: TraitCondition) => {
    const shortenAddress = (address: string) => {
      return address.length > 8
        ? `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
        : address;
    };

    return (
      <Box>
        <Typography variant="body2">
          NFT from <strong>{shortenAddress(condition.issuer)}</strong> with taxon{' '}
          <strong>{condition.taxon}</strong> and traits:
        </Typography>
        <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
          {Object.entries(condition.traits).map(([key, value], index) => (
            <li key={index}>
              <Typography variant="body2">
                {key}: {value}
              </Typography>
            </li>
          ))}
        </ul>
      </Box>
    );
  };

  const renderGroup = (group: LockGroup, depth: number = 0) => {
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          {group.operator === 'AND' ? 'ALL of:' : 'ANY of:'}
        </Typography>
        <Box sx={{ pl: 2 }}>
          {group.children.map((child, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 1,
                mb: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                borderLeft: `3px solid ${
                  child.type === 'group'
                    ? (child as LockGroup).operator === 'AND'
                      ? '#2196f3'
                      : '#ff9800'
                    : '#4caf50'
                }`,
              }}
            >
              {renderCondition(child, depth + 1)}
            </Paper>
          ))}
        </Box>
      </Box>
    );
  };

  const renderCondition = (condition: ConditionTree, depth: number = 0) => {
    switch (condition.type) {
      case 'lock':
        return renderLockCondition(condition as LockCondition);
      case 'trait':
        return renderTraitCondition(condition as TraitCondition);
      case 'group':
        return renderGroup(condition as LockGroup, depth);
      default:
        return <Typography color="error">Unknown condition type</Typography>;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Access Requirements
      </Typography>
      {renderCondition(tree)}
    </Box>
  );
};
