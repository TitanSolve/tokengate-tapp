import { Suspense } from "react";
import { MuiThemeProvider, MuiWidgetApiProvider } from '@matrix-widget-toolkit/mui';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WidgetParameter } from '@matrix-widget-toolkit/api';
import { NFTAdmin } from "./NFTAdmin";

interface AppProps {
  widgetApiPromise: Promise<any>;
}

function App({ widgetApiPromise }: AppProps) {
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
            <Routes>
              <Route path="/" element={<NFTAdmin />} />
            </Routes>
          </MuiWidgetApiProvider>
        </Suspense>
      </MuiThemeProvider>
    </BrowserRouter>
  );
}

export default App;
