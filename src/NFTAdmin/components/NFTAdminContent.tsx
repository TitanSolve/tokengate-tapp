import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  Alert, 
  Divider, 
  Container 
} from '@mui/material';
import { ConditionTree, LockCondition, TraitCondition } from '../types';
import { BasicConditionForm } from './BasicConditionForm.js';
import { QuantityConditionEditor } from './QuantityConditionEditor.js';
import { TraitsConditionEditor } from './TraitsConditionEditor.js';

interface NFTAdminContentProps {
  conditionTree: ConditionTree;
  kickMessage: string;
  hasUnsavedChanges: boolean;
  savedMessage: boolean;
  saveError: string | null;
  displayName: string | null;
  initialTab: string;
  editingBasic: LockCondition | null;
  editingQuantity: ConditionTree | null;
  editingTraits: TraitCondition | null;
  onKickMessageChange: (message: string) => void;
  onTreeChange: (tree: ConditionTree) => void;
  onSave: () => void;
  onAddCondition: (groupId: string, operator: 'AND' | 'OR') => void;
  onAddSubgroup: (parentId: string, operator: 'AND' | 'OR') => void;
  describeConditionTree: (tree: ConditionTree) => string;
  onTabChange: (tab: string) => void;
}

export const NFTAdminContent: React.FC<NFTAdminContentProps> = ({
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
}) => {
  const [currentTab, setCurrentTab] = useState(initialTab);

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    onTabChange(newValue);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            NFT Gate Settings {displayName ? `for ${displayName}` : ''}
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom sx={{ maxWidth: '500px', textAlign: 'center' }}>
            Limit room access to users who own specific NFTs
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {savedMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Settings saved successfully!
          </Alert>
        )}

        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}

        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              aria-label="NFT Gate settings tabs"
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  py: 1.5
                },
                '& .Mui-selected': {
                  color: 'primary.main',
                }
              }}
            >
              <Tab label="Basic" value="basic" />
              <Tab label="Quantity Logic" value="quantity" />
              <Tab label="NFT Traits" value="traits" />
            </Tabs>
          </Box>

          <Box role="tabpanel" hidden={currentTab !== 'basic'} sx={{ py: 3 }}>
            {currentTab === 'basic' && (
              <BasicConditionForm
                condition={editingBasic || conditionTree as LockCondition}
                onChange={onTreeChange}
              />
            )}
          </Box>

          <Box role="tabpanel" hidden={currentTab !== 'quantity'} sx={{ py: 3 }}>
            {currentTab === 'quantity' && (
              <QuantityConditionEditor
                conditionTree={editingQuantity || conditionTree}
                onChange={onTreeChange}
                onAddCondition={onAddCondition}
                onAddSubgroup={onAddSubgroup}
              />
            )}
          </Box>

          <Box role="tabpanel" hidden={currentTab !== 'traits'} sx={{ py: 3 }}>
            {currentTab === 'traits' && (
              <TraitsConditionEditor
                condition={editingTraits || (conditionTree as TraitCondition)}
                onChange={onTreeChange}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Kick Message
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Message shown to users who don't meet the requirements
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={kickMessage}
            onChange={(e) => onKickMessageChange(e.target.value)}
            placeholder="Sorry, you need to own specific NFTs to join this room."
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.light',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
              },
            }}
          />
        </Box>

        <Box sx={{ mt: 4, pt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ maxWidth: '65%' }}>
            {conditionTree && (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                <span dangerouslySetInnerHTML={{ __html: describeConditionTree(conditionTree) }} />
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={onSave}
            disabled={!hasUnsavedChanges}
            sx={{ 
              fontWeight: 600, 
              py: 1, 
              px: 3,
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
