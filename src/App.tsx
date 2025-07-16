import { Suspense, useEffect, useState } from "react";
import { MuiThemeProvider, MuiWidgetApiProvider } from '@matrix-widget-toolkit/mui';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WidgetParameter } from '@matrix-widget-toolkit/api';
import { NFTAdmin } from "./NFTAdmin";
import { STATE_EVENT_ROOM_MEMBER, STATE_EVENT_POWER_LEVELS } from "@matrix-widget-toolkit/api";
import { useWidgetApi } from "@matrix-widget-toolkit/react";
import { Typography } from '@mui/material';
import { Loader2 } from "lucide-react";

interface AppProps {
  widgetApiPromise: Promise<any>;
}

function App({ widgetApiPromise }: AppProps) {
  const [checkedPowerLevels, setCheckedPowerLevels] = useState(0);

  useEffect(() => {
    //The user who has power_level > 100 can only access this Widget
    const loadData = async () => {
      try {
        const widgetApi = useWidgetApi();
        console.log('widgetparameter--->', widgetApi.widgetParameters, widgetApi.widgetParameters.userId);
        const events = await widgetApi.receiveStateEvents(
          STATE_EVENT_ROOM_MEMBER
        );
        console.log("room.events : ", events);
        const powerLevelsEvent = await widgetApi.receiveStateEvents(STATE_EVENT_POWER_LEVELS);
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
      } catch (error) {
        console.error('Error loading power levels:', error);
        setCheckedPowerLevels(0); // Set to 1 to indicate no access
        return;
      }
    }

    loadData();
  }, []);

  return (
    <BrowserRouter>
      <MuiThemeProvider>
        <Suspense fallback={<></>}>
          <MuiWidgetApiProvider
            widgetApiPromise={widgetApiPromise}
            widgetRegistration={{
              name: 'NFT Gate',
              type: 'com.example.nftgate',
              data: { title: 'Give access to NFT holders' },
              requiredParameters: [WidgetParameter.DeviceId],
            }}
          >
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
              <Routes>
                <Route path="/" element={<NFTAdmin />} />
              </Routes>
            )}
          </MuiWidgetApiProvider>
        </Suspense>
      </MuiThemeProvider>
    </BrowserRouter>
  );
}

export default App;
