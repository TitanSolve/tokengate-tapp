import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ConditionTree, LockGroup } from '../types';
import { LockGroupComponent } from './LockGroupComponent.js';

interface QuantityConditionEditorProps {
  conditionTree: ConditionTree;
  onChange: (updatedTree: ConditionTree) => void;
  onAddCondition: (groupId: string, operator: 'AND' | 'OR') => void;
  onAddSubgroup: (parentId: string, operator: 'AND' | 'OR') => void;
}

export const QuantityConditionEditor: React.FC<QuantityConditionEditorProps> = ({
  conditionTree,
  onChange,
  onAddCondition,
  onAddSubgroup,
}) => {
  if (conditionTree.type !== 'group') {
    // Create a root group if we don't have one
    const rootGroup: LockGroup = {
      id: `group-${Date.now()}`,
      type: 'group',
      operator: 'AND',
      children: [conditionTree],
    };
    
    onChange(rootGroup);
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Quantity & Logic Conditions
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Create complex conditions using AND/OR logic with multiple NFT requirements
      </Typography>

      <Paper elevation={0} sx={{ p: 2, border: '1px dashed rgba(0, 0, 0, 0.12)', borderRadius: 2 }}>
        <LockGroupComponent
          group={conditionTree as LockGroup}
          onGroupChange={onChange as (group: LockGroup) => void}
          onAddCondition={onAddCondition}
          onAddSubgroup={onAddSubgroup}
          depth={0}
        />
      </Paper>
    </Box>
  );
};
