# TokenGate tApp

A comprehensive Vite+React+TypeScript application for controlling access to TextRP rooms based on NFT ownership, using the Matrix Widget API.

## Overview

This repository provides an NFT Gate widget for TextRP rooms that allows room administrators to restrict access based on NFT ownership criteria. The widget integrates with the XRPL and provides a user-friendly interface for setting up and managing access control conditions based on specific NFTs.

## Features

- **NFT-Based Access Control**: Control room access based on specific NFT ownership criteria
- **Automated NFT Image Fetching**: Automatically fetches and displays NFT images based on issuer and taxon
- **Multiple Condition Types**: Support for basic conditions, quantity-based conditions with logical operators (AND/OR)
- **User-Friendly Interface**: Easy-to-use admin panel for setting up access requirements
- **Vite + React + TypeScript**: Modern frontend tooling for fast development and type safety
- **Matrix Widget API Integration**: Seamless integration with TextRP rooms
- **XRP Ledger Connectivity**: Built-in utilities for connecting to XRPL and verifying NFT ownership
- **Responsive UI**: Mobile-friendly design using Material UI components

## Development Setup with CORS Proxy

This application includes a built-in CORS proxy configuration in the Vite development server to handle API requests to the NFT service. The proxy is configured in `vite.config.ts` and automatically forwards requests from `/api/*` endpoints to the appropriate backend service.

## Using the NFT Gate Widget

### For Room Administrators

1. **Basic Configuration**: Set up a simple NFT requirement by entering the NFT issuer address and taxon. The widget will automatically fetch and display the NFT image.

2. **Advanced Configuration**: Create complex access rules using the Quantity tab, where you can combine multiple NFT requirements with AND/OR operators.

3. **Save Configuration**: After setting up your desired NFT access rules, click Save to apply them to the room.

### For Developers

The NFT Gate functionality is implemented in the `src/NFTAdmin` directory with the following structure:

- `components/`: UI components for the NFT gate interface
- `hooks/`: React hooks for handling NFT admin logic
- `services/`: Services for NFT image fetching and API communication
- `types.ts`: TypeScript definitions for NFT condition types
- `utils.ts`: Utility functions
- `cache.ts`: Caching mechanism for NFT images

The main image fetching service is in `services/nftImageService.ts` which handles fetching NFT images from the API based on issuer and taxon.

## Getting Started

### Prerequisites

- Node.js (recommended latest LTS version)
- npm or yarn
- A TextRP room where you can test the widget

### Installation

1. Clone this repository
   ```
   git clone https://github.com/xurgedigitallab/tokengate-tapp.git
   cd tokengate-tapp
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Use Ngrok to expose your development server to the internet
   ```
   ngrok http http://localhost:3000
   ```

5. Add the ngrok URL to your TextRP room as a widget
   ```
   /addwidget <ngrok-url>
   ```

## Customization

### Widget Configuration

Update the widget registration in `src/App.tsx` to customize your widget's name and type:

```typescript
widgetRegistration: {
  name: 'Your Widget Name',
  type: 'com.your-domain.widget',
  data: { title: 'Your Widget Title' },
  requiredParameters: [WidgetParameter.DeviceId],
}
```

### Matrix Event Capabilities

Modify the widget capabilities in `src/main.tsx` to request only the permissions your widget needs:

```typescript
capabilities: [
  // Add or remove capabilities as needed
  WidgetEventCapability.forStateEvent(EventDirection.Receive, 'm.room.member'),
  // ...
]
```

### XRPL Integration

The template includes utilities for working with the XRP Ledger. You can customize the endpoints in the `API_URLS` configuration in `src/config.ts` or extend the functionality to support additional XRPL features.

### Environment Variables

This template uses Vite's environment variable system. All environment variables need to be prefixed with `VITE_` to be accessible in the client code. Configure your environment variables in the `.env` file.

```
VITE_SYNAPSE_ACCESS_TOKEN=your_access_token
VITE_SYNAPSE_URL=https://synapse.your-domain.com
VITE_XRPL_MAIN_NET_URL=wss://your-xrpl-endpoint
```

## TypeScript

This template uses TypeScript for type safety. You can configure TypeScript settings in the `tsconfig.json` file. The template includes type definitions for the Matrix Widget API and other dependencies.

## Vite Configuration

You can customize the Vite configuration in `vite.config.ts`. The template includes configuration for React, path aliases, and other Vite features.

## Deployment

This widget template can be deployed to any static hosting service. After building the project with `npm run build`, you can deploy the contents of the `dist` directory to services like Netlify, Vercel, or GitHub Pages.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
