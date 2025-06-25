import { useNFTAdminLogic } from './hooks/useNFTAdminLogic';
import { NFTAdminContent } from './components/NFTAdminContent.js';
import { describeConditionTree } from './utils';
import { Typography } from '@mui/material';
import { ConditionTree } from './types';

export const NFTAdmin = () => {
  const {
    savedConditionTree,
    editingBasic,
    editingQuantity,
    editingTraits,
    activeTab,
    kickMessage,
    hasUnsavedChanges,
    savedMessage,
    saveError,
    displayName,
    handleTabChange,
    handleTreeChange,
    saveConditionTree,
    addConditionToGroup,
    addSubgroup,
    setKickMessage,
  } = useNFTAdminLogic();

  if (!savedConditionTree) {
    return <Typography>Loading...</Typography>;
  }

  let activeConditionTree: ConditionTree = savedConditionTree; // Initialize with savedConditionTree
  switch (activeTab) {
    case 'basic':
      if (editingBasic) {
        activeConditionTree = editingBasic;
      }
      break;
    case 'quantity':
      if (editingQuantity) {
        activeConditionTree = editingQuantity;
      }
      break;
    case 'traits':
      if (editingTraits) {
        activeConditionTree = editingTraits;
      }
      break;
  }

  return (
    <NFTAdminContent
      conditionTree={activeConditionTree} // No longer null
      kickMessage={kickMessage}
      hasUnsavedChanges={hasUnsavedChanges}
      savedMessage={savedMessage}
      saveError={saveError}
      displayName={displayName}
      initialTab={activeTab}
      editingBasic={editingBasic}
      editingQuantity={editingQuantity}
      editingTraits={editingTraits}
      onKickMessageChange={setKickMessage}
      onTreeChange={handleTreeChange} 
      onSave={saveConditionTree}
      onAddCondition={addConditionToGroup}
      onAddSubgroup={addSubgroup}
      describeConditionTree={describeConditionTree}
      onTabChange={handleTabChange}
    />
  );
};
