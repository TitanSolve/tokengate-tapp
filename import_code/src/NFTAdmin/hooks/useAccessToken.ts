//example-widget-mui/src/NFTAdmin/hooks/useAccessToken.ts

import { useEffect, useState } from 'react';
import { useWidgetApi } from '@matrix-widget-toolkit/react';

export const useAccessToken = () => {
  const widgetApi = useWidgetApi();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const fetchAccessToken = async () => {
    try {
      const token = await widgetApi.requestOpenIDConnectToken();
      setAccessToken(token.access_token || null);
    } catch (error) {
      console.error('Failed to fetch access token:', error);
    }
  };

  useEffect(() => {
    fetchAccessToken();
  }, [widgetApi]);

  return { accessToken };
};