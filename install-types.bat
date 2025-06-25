@echo off
echo Installing TypeScript type definitions for dependencies...

rem Install core dependencies for Vite and TypeScript project
npm install --save-dev vite @vitejs/plugin-react typescript

rem Install core React and TypeScript types
npm install --save-dev @types/react @types/react-dom @types/node

rem Install types for UI components and libraries
npm install --save-dev @types/mui__material
npm install --save-dev @types/react-slick
npm install --save-dev @types/react-swipeable-views

rem Install additional types needed for the project
npm install --save-dev @types/buffer

echo Type definitions installed successfully.
echo.
echo You can now run 'npm run dev' to start the development server.
