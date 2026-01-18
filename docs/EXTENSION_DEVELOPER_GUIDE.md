# AegisOSINT Extension Developer Guide

## Project Structure

The project has been restructured to keep all extension-specific code within the `extension/` directory.

```
/
├── docs/                # Documentation
├── extension/           # Extension Source Code
│   ├── src/             # Source files (React, Background, Content Scripts)
│   ├── public/          # Static assets (icons)
│   ├── manifest.json    # Chrome Extension Manifest
│   ├── package.json     # Dependencies and scripts
│   ├── vite.config.js   # Build configuration
│   └── tailwind.config.js # Tailwind configuration
└── README.md            # General project readme
```

## Getting Started

### 1. Installation

Navigate to the extension directory and install dependencies:

```bash
cd extension
npm install
```

### 2. Development

Start the development server with hot-reload:

```bash
cd extension
npm run dev
```

> **Note:** Always run npm commands from inside the `extension` folder.

### 3. Loading in Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked**.
4. Select the `extension/dist` folder (this folder is generated after running `npm run dev` or `npm run build`).

## Key Commands

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the extension for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
