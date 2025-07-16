import { useEffect } from 'react';
import { useWidgetApi } from "@matrix-widget-toolkit/react";
import { useNFTAdminLogic } from './hooks/useNFTAdminLogic';
import { NFTAdminContent } from './components/NFTAdminContent.js';
import { describeConditionTree } from './utils';
import { Typography } from '@mui/material';
import { ConditionTree } from './types';
// import { l } from 'node_modules/vite/dist/node/types.d-aGj9QkWt.js';

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

  const widgetApi = useWidgetApi();

  useEffect(() => {
    //The user who has power_level > 100 can only access this Widget
    const loadData = async () => {
      console.log('widgetparameter--->', widgetApi.widgetParameters);
      const powerLevelsEvent = await widgetApi.receiveStateEvents('m.room.power_levels');
      console.log('Power levels event:', powerLevelsEvent);
      if (powerLevelsEvent) {
        interface User {
          name: string;
          userId: string;
          powerLevel?: number; // optional since we are adding it later
        }

        interface PowerLevelsEvent {
          content: {
            users: Record<string, number>; // Map userId to power level
          };
        }
        const powerLevelsEvent: PowerLevelsEvent[] = await widgetApi.receiveStateEvents('m.room.power_levels');

        if (powerLevelsEvent && powerLevelsEvent[0]) {
          const powerLevels = powerLevelsEvent[0]?.content?.users || {};
          console.log('Power levels:', powerLevels);

          // Assuming usersList is available and is an array of User objects
          const usersList: User[] = []; // Replace this with your actual usersList data
          // Now, map users to their power levels
          const usersWithPowerLevels = usersList.map((user) => {
            // Get the user's power level, default to 0 if not found
            const powerLevel = powerLevels[user.userId] || 0;
            return { ...user, powerLevel };
          });

          console.log('Users with power levels:', usersWithPowerLevels);
        }
      }
    }

    loadData();
  }, []);

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
