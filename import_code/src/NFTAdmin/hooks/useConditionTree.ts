// NFTAdmin/hooks/useConditionTree.ts
import { useCallback } from 'react';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { trimRoomId } from '../utils';
import { RoomSettings } from '../types'; // Import RoomSettings instead of ConditionTree

export const useConditionTree = () => {
  const widgetApi = useWidgetApi();
  const apiUrl = 'https://7a36-155-94-255-2.ngrok-free.app ';

  const fetchConditionTree = useCallback(async (): Promise<RoomSettings | null> => {
    const rawRoomId = widgetApi.widgetParameters.roomId;
    if (!rawRoomId) return null;
    const roomId = trimRoomId(rawRoomId);

    try {
      const response = await fetch(`${apiUrl}/api/admin/settings?roomId=${encodeURIComponent(roomId)}`, {
        headers: { Authorization: 'Bearer 1234567890QWERTYUIOP' },
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      return data as RoomSettings; // Cast to RoomSettings
    } catch (error) {
      console.error('Error fetching condition tree:', error);
      return null;
    }
  }, [widgetApi]);

  return { fetchConditionTree };
};