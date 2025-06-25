// example-widget-mui/src/NFTAdmin/components/QuantityConditionEditor.tsx
  
import { Box, IconButton, Typography } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { LockGroupComponent } from './LockGroupComponent';
import { LockConditionDisplayEdit } from './LockConditionDisplayEdit';
import { ConditionTree, LockCondition, LockGroup } from '../types';

interface QuantityConditionEditorProps {
  conditionTree: ConditionTree;
  onChange: (newTree: ConditionTree) => void;
  onAddCondition: () => void;
  onAddSubgroup: () => void;
}

export const QuantityConditionEditor = ({
  conditionTree,
  onChange,
  onAddCondition,
  onAddSubgroup,
}: QuantityConditionEditorProps) => {
  console.log('QuantityConditionEditor received conditionTree:', JSON.stringify(conditionTree, null, 2));

  const handleRemove = () => {
    onChange({
      type: 'group',
      id: `group-${Date.now()}`,
      operator: 'AND',
      children: [],
    } as LockGroup);
  };

  const handleGroupChange = (newGroup: ConditionTree) => {
    if (newGroup.type === 'group' && newGroup.children.length === 0) {
      handleRemove();
    } else {
      onChange(newGroup);
    }
  };

  const renderEditor = () => {
    if (conditionTree.type === 'lock') {
      const { issuer, taxon, nftCount, nftImageUrl } = conditionTree as LockCondition;
      const hasInput = issuer || taxon || nftCount > 0 || nftImageUrl;

      if (!hasInput) {
        return (
          <Box>
            <Typography>No valid conditions set yet</Typography>
            <Box mt={2} sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary" onClick={onAddCondition} aria-label="Add NFT" title="Add NFT">
                <AddCircleIcon />
              </IconButton>
              <IconButton
                color="primary"
                onClick={onAddSubgroup}
                aria-label="Add Nested Group"
                title="Add Nested Group"
              >
                <SubdirectoryArrowRightIcon />
              </IconButton>
            </Box>
          </Box>
        );
      }

      return (
        <Box>
          <LockConditionDisplayEdit condition={conditionTree as LockCondition} onChange={onChange} onRemove={handleRemove} />
          <Box mt={2} sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="primary" onClick={onAddCondition} aria-label="Add NFT" title="Add NFT">
              <AddCircleIcon />
            </IconButton>
            <IconButton
              color="primary"
              onClick={onAddSubgroup}
              aria-label="Add Nested Group"
              title="Add Nested Group"
            >
              <SubdirectoryArrowRightIcon />
            </IconButton>
          </Box>
        </Box>
      );
    } else if (conditionTree.type === 'group') {
      const group = conditionTree as LockGroup;
      if (group.children.length === 0) {
        return (
          <Box>
            <Typography>No valid conditions set yet</Typography>
            <Box mt={2} sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary" onClick={onAddCondition} aria-label="Add NFT" title="Add NFT">
                <AddCircleIcon />
              </IconButton>
              <IconButton
                color="primary"
                onClick={onAddSubgroup}
                aria-label="Add Nested Group"
                title="Add Nested Group"
              >
                <SubdirectoryArrowRightIcon />
              </IconButton>
            </Box>
          </Box>
        );
      }

      return (
        <Box>
          <LockGroupComponent
            group={group}
            onChange={handleGroupChange}
            onRemove={handleRemove}
            onAddCondition={onAddCondition}
            onAddSubgroup={onAddSubgroup}
            depth={0}
          />
          <Box mt={2} sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="primary" onClick={onAddCondition} aria-label="Add NFT" title="Add NFT">
              <AddCircleIcon />
            </IconButton>
            <IconButton
              color="primary"
              onClick={onAddSubgroup}
              aria-label="Add Nested Group"
              title="Add Nested Group"
            >
              <SubdirectoryArrowRightIcon />
            </IconButton>
          </Box>
        </Box>
      );
    } else {
      return (
        <Box>
          <Typography color="error">Unsupported condition type: {conditionTree.type}</Typography>
          <Box mt={2} sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="primary" onClick={onAddCondition} aria-label="Add NFT" title="Add NFT">
              <AddCircleIcon />
            </IconButton>
            <IconButton
              color="primary"
              onClick={onAddSubgroup}
              aria-label="Add Nested Group"
              title="Add Nested Group"
            >
              <SubdirectoryArrowRightIcon />
            </IconButton>
          </Box>
        </Box>
      );
    }
  };

  return <Box sx={{ mt: 2 }}>{renderEditor()}</Box>;
};