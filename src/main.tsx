import React from 'react';
import ReactDOM from 'react-dom/client';
import { WidgetApiImpl } from '@matrix-widget-toolkit/api';
import { EventDirection, WidgetEventCapability } from 'matrix-widget-api';
import './index.css';
import App from './App';

const widgetApiPromise = WidgetApiImpl.create({
  //TODO: Remove Capabilities you don't need
  capabilities: [
    WidgetEventCapability.forStateEvent(
      EventDirection.Receive,
      'm.room.member'
    ),
    WidgetEventCapability.forStateEvent(
      EventDirection.Receive,
      'm.room.name'
    ),
    WidgetEventCapability.forRoomEvent(
      EventDirection.Receive,
      'm.room.message'
    ),
    WidgetEventCapability.forRoomEvent(
      EventDirection.Receive,
      'm.reaction'
    ),
    WidgetEventCapability.forRoomEvent(
      EventDirection.Send,
      'm.room.message'
    ),
    WidgetEventCapability.forRoomEvent(
      EventDirection.Send,
      'm.room.redaction'
    ),
    WidgetEventCapability.forStateEvent(
      EventDirection.Receive,
      '*'
    ),
  ],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App widgetApiPromise={widgetApiPromise} />
  </React.StrictMode>
);
