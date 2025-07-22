import { useEffect, useState } from 'react';
import { useNFTAdminLogic } from './hooks/useNFTAdminLogic';
import { NFTAdminContent } from './components/NFTAdminContent.js';
import { describeConditionTree } from './utils';
import { Typography } from '@mui/material';
import { ConditionTree } from './types';
import { Loader2 } from "lucide-react";
import * as sdk from "matrix-js-sdk";
import API_URLS from "../config.ts";
import { useWidgetApi } from "@matrix-widget-toolkit/react";
// import { l } from 'node_modules/vite/dist/node/types.d-aGj9QkWt.js';

export const NFTAdmin = () => {
  const [checkedPowerLevels, setCheckedPowerLevels] = useState(0);
  const widgetApi = useWidgetApi();

  useEffect(() => {
    console.log('widgetApi widgetParameters:', widgetApi.widgetParameters);
    // The user who has power_level > 100 can only access this Widget
    const loadData = async () => {
      try {
        const accessToken = API_URLS.accesstoken || " ";
        const userId = API_URLS.synapseUserId || "@tokengatebot:synapse.textrp.io";
        const baseUrl: string = API_URLS.synapseUrl || "http://localhost:8008";
        console.log('baseUrl:', baseUrl);
        const matrixClient = sdk.createClient({
          baseUrl,
          accessToken,
          userId
        });
        console.log('Matrix client created:', matrixClient);
        const roomId = widgetApi.widgetParameters.roomId || '';
        try {
          await matrixClient.joinRoom(roomId);
          console.log(`🤖 Bot joined room: ${roomId}`);
        } catch (err) {
          console.warn('⚠️ Bot already in room or join failed:', err);
        }
        const currentPowerLevels = await matrixClient.getStateEvent(
          roomId,
          "m.room.power_levels",
          ""
        );
        console.log('Current power levels:', currentPowerLevels);

        const curUserId = widgetApi.widgetParameters.userId || userId;
        console.log('widgetApi widgetParameters:', widgetApi.widgetParameters);
        console.log('Current user ID:', curUserId);
        const userPower = currentPowerLevels.users?.[ curUserId ] ?? currentPowerLevels.users_default ?? 0;
        console.log('User', curUserId, 'power level:', userPower);

        if (userPower >= 100) {
          setCheckedPowerLevels(2); // Set to 2 to indicate access granted
          console.log('User has sufficient power level to access the widget.');
        }
        else {
          setCheckedPowerLevels(1); // Set to 1 to indicate no access
          console.log('User does not have sufficient power level to access the widget.');
        }
      } catch (error) {
        console.error('Error loading power levels:', error);
        setCheckedPowerLevels(0); // Set to 1 to indicate no access
        return;
      }
    }

    loadData();
    setCheckedPowerLevels(0);
  }, [widgetApi]);

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
    <div>
      {checkedPowerLevels === 0 ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#363C43] z-50">
          <Loader2 className="animate-spin text-blue-600 dark:text-blue-400 w-12 h-12 mb-4" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Please wait while we check your permissions...</p>
        </div>
      ) : checkedPowerLevels === 1 ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#363C43] z-50">
          <Typography variant="h6" color="error" align="center">
            You do not have permission to access this widget.
          </Typography>
        </div>
      ) : (
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
      )}
    </div>
  );

  // return (
  //   <div>
  //     <NFTAdminContent
  //       conditionTree={activeConditionTree} // No longer null
  //       kickMessage={kickMessage}
  //       hasUnsavedChanges={hasUnsavedChanges}
  //       savedMessage={savedMessage}
  //       saveError={saveError}
  //       displayName={displayName}
  //       initialTab={activeTab}
  //       editingBasic={editingBasic}
  //       editingQuantity={editingQuantity}
  //       editingTraits={editingTraits}
  //       onKickMessageChange={setKickMessage}
  //       onTreeChange={handleTreeChange}
  //       onSave={saveConditionTree}
  //       onAddCondition={addConditionToGroup}
  //       onAddSubgroup={addSubgroup}
  //       describeConditionTree={describeConditionTree}
  //       onTabChange={handleTabChange}
  //     />
  //   </div>
  // );
};
