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

import { WidgetApi, WidgetParameter } from '@matrix-widget-toolkit/api';
import {
  MuiThemeProvider,
  MuiWidgetApiProvider,
} from '@matrix-widget-toolkit/mui';
import { ReactElement, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NFTAdmin } from '../NFTAdmin';

export function App({
  widgetApiPromise,
}: {
  widgetApiPromise: Promise<WidgetApi>;
}): ReactElement {
  return (
    <BrowserRouter>
      <MuiThemeProvider>
        {/* Fallback suspense if no higher one is registered (used for i18n) */}
        <Suspense fallback={<></>}>
          <MuiWidgetApiProvider
            widgetApiPromise={widgetApiPromise}
            widgetRegistration={{
              name: 'NFT Gate',
              type: 'com.example.app',
              data: { title: 'Give access to NFT holders' },
              // Device ID is required for the WelcomePage example
              requiredParameters: [WidgetParameter.DeviceId],
            }}
          > 
            <Routes>
              <Route path="/" element={<NFTAdmin />} />
            </Routes>
          </MuiWidgetApiProvider>
        </Suspense>
      </MuiThemeProvider>
    </BrowserRouter>
  );
}
