import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Collapse,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { ConditionTree, LockCondition, TraitCondition } from '../types';
import { LockConditionCard } from './LockConditionCard.js';

interface LockConditionDisplayEditProps {
  condition: ConditionTree;
  onConditionChange: (updatedCondition: ConditionTree) => void;
  onRemove: () => void;
}

export const LockConditionDisplayEdit: React.FC<LockConditionDisplayEditProps> = ({
  condition,
  onConditionChange,
  onRemove,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<any>({
    issuer: condition.type === 'lock' || condition.type === 'trait' ? condition.issuer : '',
    taxon: condition.type === 'lock' || condition.type === 'trait' ? condition.taxon : '',
    nftCount: condition.type === 'lock' ? condition.nftCount : 1,
    nftImageUrl: condition.type === 'lock' || condition.type === 'trait' ? condition.nftImageUrl : null,
    traits: condition.type === 'trait' ? {...condition.traits} : {},
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (field: string, value: any) => {
    setEditValues({
      ...editValues,
      [field]: value,
    });
  };

  const handleSave = () => {
    let updatedCondition: ConditionTree;
    
    if (condition.type === 'lock') {
      updatedCondition = {
        ...condition as LockCondition,
        issuer: editValues.issuer,
        taxon: editValues.taxon,
        nftCount: editValues.nftCount < 1 ? 1 : editValues.nftCount,
        nftImageUrl: editValues.nftImageUrl,
      };
    } else if (condition.type === 'trait') {
      updatedCondition = {
        ...condition as TraitCondition,
        issuer: editValues.issuer,
        taxon: editValues.taxon,
        nftImageUrl: editValues.nftImageUrl,
        traits: editValues.traits,
      };
    } else {
      // In case of unknown condition type, just return original
      updatedCondition = condition;
    }
    
    onConditionChange(updatedCondition);
    setIsEditing(false);
  };

  return (
    <Box>
      {/* Display mode */}
      {!isEditing && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <LockConditionCard condition={condition} />
          <Box>
            <IconButton color="primary" onClick={handleEditToggle} size="small" sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={onRemove} size="small">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Edit mode */}
      <Collapse in={isEditing}>
        <Box sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: 1, mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Edit NFT Requirement
          </Typography>
          
          <TextField
            fullWidth
            label="Issuer Address"
            value={editValues.issuer}
            onChange={(e) => handleChange('issuer', e.target.value)}
            margin="dense"
            size="small"
          />
          
          <TextField
            fullWidth
            label="Taxon"
            value={editValues.taxon}
            onChange={(e) => handleChange('taxon', e.target.value)}
            margin="dense"
            size="small"
          />
          
          {condition.type === 'lock' && (
            <TextField
              fullWidth
              label="Required Count"
              type="number"
              value={editValues.nftCount}
              onChange={(e) => handleChange('nftCount', parseInt(e.target.value, 10) || 1)}
              margin="dense"
              size="small"
              InputProps={{
                inputProps: { min: 1 },
                startAdornment: <InputAdornment position="start">#</InputAdornment>,
              }}
            />
          )}
          
          <TextField
            fullWidth
            label="NFT Image URL (Optional)"
            value={editValues.nftImageUrl || ''}
            onChange={(e) => handleChange('nftImageUrl', e.target.value || null)}
            margin="dense"
            size="small"
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              startIcon={<CancelIcon />}
              onClick={handleEditToggle}
              sx={{ mr: 1 }}
              size="small"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              size="small"
            >
              Save
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};
