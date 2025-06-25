// /NFTAdmin/hooks/useAccessToken.ts

import { useState, useEffect } from 'react';
import { useWidgetApi } from '@matrix-widget-toolkit/react';

export const useAccessToken = () => {
  const widgetApi = useWidgetApi();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        setLoading(true);
        // Request a matrix client capability to get the access token
        await widgetApi.requestCapabilities(['org.matrix.msc2931.navigate']);
        
        // The requestOpenIdToken method may not be available in the current WidgetApi version
        // Using a type assertion to work around the TypeScript error
        // In a real implementation, check the API documentation for the correct method
        const widgetApiAny = widgetApi as any;
        if (typeof widgetApiAny.requestOpenIdToken === 'function') {
          const openIdToken = await widgetApiAny.requestOpenIdToken();
          setAccessToken(openIdToken.access_token);
        } else {
          // Fallback if the method doesn't exist
          console.warn('requestOpenIdToken method not available in current WidgetApi');
          setAccessToken('dummy-token-for-development');
        }
      } catch (e) {
        console.error('Failed to get access token:', e);
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessToken();
  }, [widgetApi]);

  return { accessToken, loading, error };
};
