//example-widget-mui/src/NFTAdmin/components/LockConditionCard.tsx

import { Card, CardContent, TextField } from '@mui/material';
import { LockCondition } from '../types';

interface LockConditionCardProps {
  condition: LockCondition;
  onChange: (updated: LockCondition) => void;
}

export const LockConditionCard = ({ condition, onChange }: LockConditionCardProps) => {
  return (
    <Card sx={{ minWidth: 200, m: 1 }}>
      <CardContent>
        <TextField
          label="Issuer Address"
          value={condition.issuer}
          onChange={(e) => onChange({ ...condition, issuer: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Taxon"
          value={condition.taxon}
          onChange={(e) => onChange({ ...condition, taxon: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Number of NFTs Required"
          type="number"
          value={condition.nftCount}
          onChange={(e) => onChange({ ...condition, nftCount: Number(e.target.value) })}
          fullWidth
          margin="normal"
        />
      </CardContent>
    </Card>
  );
};