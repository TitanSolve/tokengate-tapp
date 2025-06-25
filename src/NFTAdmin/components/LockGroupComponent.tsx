import React from 'react';
import {
  Box,
  Button,
  Typography,
  ButtonGroup,
  Paper,
  Chip,
} from '@mui/material';
import { LockGroup, ConditionTree } from '../types';
import { LockConditionDisplayEdit } from './LockConditionDisplayEdit.js';
import AddIcon from '@mui/icons-material/Add';

interface LockGroupComponentProps {
  group: LockGroup;
  onGroupChange: (updatedGroup: LockGroup) => void;
  onAddCondition: (groupId: string, operator: 'AND' | 'OR') => void;
  onAddSubgroup: (parentId: string, operator: 'AND' | 'OR') => void;
  depth: number;
}

export const LockGroupComponent: React.FC<LockGroupComponentProps> = ({
  group,
  onGroupChange,
  onAddCondition,
  onAddSubgroup,
  depth,
}) => {
  const handleOperatorToggle = () => {
    const newOperator = group.operator === 'AND' ? 'OR' : 'AND';
    onGroupChange({ ...group, operator: newOperator });
  };

  const handleChildChange = (index: number, updatedChild: ConditionTree) => {
    const newChildren = [...group.children];
    newChildren[index] = updatedChild;
    onGroupChange({ ...group, children: newChildren });
  };

  const handleChildRemove = (index: number) => {
    const newChildren = [...group.children];
    newChildren.splice(index, 1);
    onGroupChange({ ...group, children: newChildren });
  };

  return (
    <Box sx={{ 
      mb: 2, 
      p: 1, 
      borderLeft: depth > 0 ? `4px solid ${group.operator === 'AND' ? '#2196f3' : '#ff9800'}` : 'none',
      pl: depth > 0 ? 2 : 0
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Chip
          label={group.operator}
          color={group.operator === 'AND' ? 'primary' : 'warning'}
          onClick={handleOperatorToggle}
          sx={{ mr: 1 }}
        />
        <Typography variant="body2" color="textSecondary">
          {group.operator === 'AND' 
            ? 'Users must meet ALL of these conditions' 
            : 'Users must meet ANY of these conditions'}
        </Typography>
      </Box>

      {group.children.map((child, index) => (
        <Paper
          key={`${child.id}-${index}`}
          elevation={1}
          sx={{ mb: 2, p: 2, border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: 1 }}
        >
          {child.type === 'group' ? (
            <LockGroupComponent
              group={child as LockGroup}
              onGroupChange={(updatedGroup) => handleChildChange(index, updatedGroup)}
              onAddCondition={onAddCondition}
              onAddSubgroup={onAddSubgroup}
              depth={depth + 1}
            />
          ) : (
            <LockConditionDisplayEdit
              condition={child}
              onConditionChange={(updatedCondition: ConditionTree) => handleChildChange(index, updatedCondition)}
              onRemove={() => handleChildRemove(index)}
            />
          )}
        </Paper>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <ButtonGroup variant="outlined" size="small">
          <Button
            startIcon={<AddIcon />}
            onClick={() => onAddCondition(group.id, group.operator)}
          >
            Add Condition
          </Button>
          <Button
            onClick={() => onAddSubgroup(group.id, 'AND')}
          >
            Add AND Group
          </Button>
          <Button
            onClick={() => onAddSubgroup(group.id, 'OR')}
          >
            Add OR Group
          </Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
};
