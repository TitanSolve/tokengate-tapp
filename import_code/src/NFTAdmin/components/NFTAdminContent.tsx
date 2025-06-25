// example-widget-mui/src/NFTAdmin/components/NFTAdminContent.tsx

import { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Typography, TextField, Tabs, Tab } from '@mui/material';
import { BasicConditionForm } from './BasicConditionForm';
import { QuantityConditionEditor } from './QuantityConditionEditor';
import { TraitsConditionEditor } from './TraitsConditionEditor';
import { ConditionTree, LockCondition, TraitCondition } from '../types';

interface NFTAdminContentProps {
  conditionTree: ConditionTree;
  kickMessage: string;
  hasUnsavedChanges: boolean;
  savedMessage: boolean;
  saveError: string | null;
  displayName: string;
  initialTab: string;
  editingBasic: LockCondition | null;
  editingQuantity: ConditionTree | null;
  editingTraits: TraitCondition | null;
  onKickMessageChange: (value: string) => void;
  onTreeChange: (newTree: ConditionTree | null) => void;
  onSave: () => void;
  onAddCondition: () => void;
  onAddSubgroup: () => void;
  describeConditionTree: (tree: ConditionTree, depth?: number) => string;
  onTabChange: (newTab: string) => void;
}

export const NFTAdminContent = ({
  conditionTree,
  kickMessage,
  hasUnsavedChanges,
  savedMessage,
  saveError,
  displayName,
  initialTab,
  editingBasic,
  editingQuantity,
  editingTraits,
  onKickMessageChange,
  onTreeChange,
  onSave,
  onAddCondition,
  onAddSubgroup,
  describeConditionTree,
  onTabChange,
}: NFTAdminContentProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    console.log(`Switching to tab: ${newValue}`);
    console.log(`conditionTree before switch:`, JSON.stringify(conditionTree, null, 2));
    setActiveTab(newValue);
    onTabChange(newValue);
  };

  const filterValidConditions = (tree: ConditionTree): ConditionTree => {
    if (tree.type === 'lock' || tree.type === 'trait') {
      return { ...tree };
    }
    const validChildren = (tree as { children: ConditionTree[] }).children
      .map(child => filterValidConditions(child))
      .filter(child => child.type === 'group' || child.type === 'lock' || child.type === 'trait');
    return { ...tree, children: validChildren };
  };

  const filteredTree = filterValidConditions(conditionTree);

  return (
    <Box component="main">
      <Typography variant="h5" sx={{ mx: 2, mt: 2, mb: 2 }}>
        Hello, {displayName}
      </Typography>
      <Card sx={{ mt: 2, mx: 2 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Basic" value="basic" />
            <Tab label="By Quantity" value="quantity" />
            <Tab label="By Traits" value="traits" />
          </Tabs>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, mb: 2 }}
            dangerouslySetInnerHTML={{ __html: describeConditionTree(filteredTree, 0) }}
          />
          {activeTab === 'basic' && (
            <BasicConditionForm
              onChange={onTreeChange}
              initialCondition={editingBasic}
            />
          )}
          {activeTab === 'quantity' && (
            <QuantityConditionEditor
              conditionTree={editingQuantity || conditionTree}
              onChange={onTreeChange}
              onAddCondition={onAddCondition}
              onAddSubgroup={onAddSubgroup}
            />
          )}
          {activeTab === 'traits' && (
            <TraitsConditionEditor
              onChange={onTreeChange}
              initialCondition={editingTraits}
            />
          )}
          {hasUnsavedChanges && (
            <Typography
              color="warning.main"
              sx={{ mt: 1, opacity: 1, transition: 'opacity 0.5s', '&:hover': { opacity: 0 } }}
            >
              Unsaved changes – save to apply
            </Typography>
          )}
          {saveError && (
            <Typography color="error.main" sx={{ mt: 1 }}>
              {saveError}
            </Typography>
          )}
          <TextField
            label="Removal Message"
            value={kickMessage}
            onChange={(e) => onKickMessageChange(e.target.value)}
            fullWidth
            margin="normal"
            helperText="Message shown to users removed for insufficient NFTs"
            sx={{ mt: 2 }}
          />
          <Button
            variant="contained"
            color={hasUnsavedChanges ? 'warning' : 'inherit'}
            disabled={!hasUnsavedChanges}
            onClick={onSave}
            sx={{
              mt: 2,
              ...(hasUnsavedChanges && {
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(255, 167, 38, 0.7)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(255, 167, 38, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(255, 167, 38, 0)' },
                },
              }),
            }}
          >
            {hasUnsavedChanges ? 'Save Changes' : savedMessage ? 'Saved' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};