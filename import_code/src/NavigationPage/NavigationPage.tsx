
/*
 * Copyright 2022 Nordeck IT + Consulting GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { MuiCapabilitiesGuard } from '@matrix-widget-toolkit/mui';
import { Box } from '@mui/material';
import { ReactElement, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import { useGetPowerLevelsQuery } from '../PowerLevelsPage/powerLevelsApi'; // Directly using the API from PowerLevelsPage
import { StoreProvider } from '../store';

export const NavigationPage = (): ReactElement => {
  const navigate = useNavigate();
  const widgetApi = useWidgetApi();

  return (
    <MuiCapabilitiesGuard
      capabilities={[
        WidgetEventCapability.forStateEvent(
          EventDirection.Receive,
          'm.room.power_levels', // Directly use the state event type
        ),
      ]}
    >
      <StoreProvider>
        <NavigationContent />
      </StoreProvider>
    </MuiCapabilitiesGuard>
  );
};

const NavigationContent = (): ReactElement => {
  const navigate = useNavigate();
  const widgetApi = useWidgetApi();
  const { data: powerLevelsEvent } = useGetPowerLevelsQuery(); // Fetch power levels

  useEffect(() => {
    const navigateBasedOnPowerLevel = async () => {
      if (powerLevelsEvent) {
        const userId = widgetApi.widgetParameters.userId;

        // Ensure userId is defined
        if (!userId) {
          console.error("User ID is undefined");
          navigate('/room'); // Fallback
          return;
        }

        const userPowerLevel = powerLevelsEvent.content?.users?.[userId] ?? 0;

        if (userPowerLevel >= 100) {
          navigate('/nftadmin');
        } else if (userPowerLevel >= 50) {
          navigate('/room');
        } else {
          navigate('/room'); // Fallback
        }
      }
    };
    navigateBasedOnPowerLevel();
  }, [powerLevelsEvent, navigate, widgetApi]);

  return <Box />;
};