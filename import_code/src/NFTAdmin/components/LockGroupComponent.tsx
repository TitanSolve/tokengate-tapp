// NFTAdmin/components/LockGroupComponent.tsx
import { Box, Typography, ToggleButton, ToggleButtonGroup, IconButton } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import CancelIcon from '@mui/icons-material/Cancel';
import { LockConditionDisplayEdit } from './LockConditionDisplayEdit';
import { ConditionTree, LockCondition, LockGroup } from '../types';

interface LockGroupComponentProps {
  group: LockGroup;
  onChange: (newTree: ConditionTree) => void;
  onRemove?: () => void; // Optional, used by parent to remove this group
  onAddCondition: () => void; // Add NFT at this group level
  onAddSubgroup: () => void; // Add subgroup at this group level
  depth?: number; // Optional, for nested shading
}

export const LockGroupComponent = ({
  group,
  onChange,
  onRemove,
  onAddCondition,
  onAddSubgroup,
  depth = 0,
}: LockGroupComponentProps) => {
  const handleOperatorChange = (event: React.MouseEvent<HTMLElement>, newOperator: 'AND' | 'OR') => {
    if (newOperator) {
      onChange({ ...group, operator: newOperator });
    }
  };

  const handleChildChange = (index: number, newChild: ConditionTree) => {
    const newChildren = [...group.children];
    newChildren[index] = newChild;
    onChange({ ...group, children: newChildren });
  };

  const handleChildRemove = (index: number) => {
    const newChildren = group.children.filter((_, i) => i !== index);
    if (newChildren.length === 0 && onRemove) {
      onRemove();
    } else {
      onChange({ ...group, children: newChildren });
    }
  };

  const handleGroupRemove = () => {
    if (onRemove) {
      onRemove();
    }
  };

  const handleAddCondition = () => {
    const newCondition: LockCondition = {
      type: 'lock',
      id: `lock-${Date.now()}`,
      issuer: '',
      taxon: '',
      nftCount: 1,
      nftImageUrl: null,
    };
    onChange({ ...group, children: [...group.children, newCondition] });
  };

  const handleAddSubgroup = () => {
    const newSubgroup: LockGroup = {
      type: 'group',
      id: `group-${Date.now()}`,
      operator: 'AND',
      children: [],
    };
    onChange({ ...group, children: [...group.children, newSubgroup] });
  };

  const bgColor = depth === 0 ? 'grey.900' : depth === 1 ? 'grey.800' : 'grey.700';

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        backgroundColor: bgColor,
        border: '1px solid',
        borderColor: 'grey.400',
        borderRadius: 2,
        boxShadow: depth > 0 ? `inset 0 0 4px rgba(0, 0, 0, 0.${depth + 1})` : 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ToggleButtonGroup
          value={group.operator}
          exclusive
          onChange={handleOperatorChange}
          aria-label="operator toggle"
          size="small"
        >
          <ToggleButton value="AND" aria-label="all of">
            AND
          </ToggleButton>
          <ToggleButton value="OR" aria-label="any of">
            OR
          </ToggleButton>
        </ToggleButtonGroup>
        <IconButton
          color="error"
          onClick={handleGroupRemove}
          title="Remove Group"
          size="small"
        >
          <CancelIcon />
        </IconButton>
      </Box>
      <Box sx={{ ml: 2, mt: 1 }}>
        {group.children.length === 0 ? (
          <Typography>No conditions in this group</Typography>
        ) : (
          group.children.map((child, index) => (
            <Box key={child.id} sx={{ mt: 1 }}>
              {child.type === 'lock' ? (
                <LockConditionDisplayEdit
                  condition={child}
                  onChange={(newChild) => handleChildChange(index, newChild)}
                  onRemove={() => handleChildRemove(index)}
                />
              ) : child.type === 'group' ? (
                <LockGroupComponent
                  group={child as LockGroup}
                  onChange={(newChild) => handleChildChange(index, newChild)}
                  onRemove={() => handleChildRemove(index)}
                  onAddCondition={onAddCondition}
                  onAddSubgroup={onAddSubgroup}
                  depth={depth + 1}
                />
              ) : (
                <Typography color="error">Unsupported child type: {child.type}</Typography>
              )}
            </Box>
          ))
        )}
      </Box>
      <Box mt={2} sx={{ display: 'flex', gap: 1 }}>
        <IconButton color="primary" onClick={handleAddCondition} aria-label="Add NFT" title="Add NFT">
          <AddCircleIcon />
        </IconButton>
        <IconButton
          color="primary"
          onClick={handleAddSubgroup}
          aria-label="Add Nested Group"
          title="Add Nested Group"
        >
          <SubdirectoryArrowRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
};