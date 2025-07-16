import { Suspense} from "react";
import { MuiThemeProvider, MuiWidgetApiProvider } from '@matrix-widget-toolkit/mui';
import { BrowserRouter} from 'react-router-dom';
import { WidgetParameter } from '@matrix-widget-toolkit/api';
import Home from "./pages/Home";
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
            <Home />
          </MuiWidgetApiProvider>
        </Suspense>
      </MuiThemeProvider>
    </BrowserRouter>
  );
}

export default App;
