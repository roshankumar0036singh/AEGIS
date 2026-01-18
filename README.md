# AegisOSINT

<div align="center">

![AegisOSINT Logo](public/icons/icon128.png)

**Autonomous Agentic OSINT Investigation Framework**

A next-generation Chrome extension for automated Open Source Intelligence investigations powered by AI agents.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-0.1.0-orange.svg)](package.json)

</div>

---

## ✨ Features

### 🤖 AI-Powered Agents
- **The Inquisitor** - Mission control & conversation interface
- **The Scout** - Multi-source data acquisition (Tavily, LinkedIn, Twitter, GitHub, etc.)
- **The Auditor** - Cross-verification & conflict detection
- **The Cartographer** - Knowledge graph visualization
- **The Archivist** - Evidence preservation & reporting

### 🔍 Intelligence Gathering
- **Social Media Intelligence** - LinkedIn, Twitter/X, GitHub, Instagram
- **Breach Data Checking** - HaveIBeenPwned integration
- **GitHub Patch Trick** - Extract private emails from commits
- **Web Search** - Tavily AI-powered search
- **Domain Intelligence** - Whois/DNS lookups

### 🎨 Premium UI
- **Glassmorphism Design** - Modern, translucent interface
- **Dark Mode** - OSINT-optimized color scheme
- **Smooth Animations** - Fade-ins, slides, and scale effects
- **Responsive Layout** - Works on all screen sizes
- **Quick Actions** - Pre-filled query templates

### 🔒 Privacy & Security
- **Local Storage** - All data stored in browser (chrome.storage.local)
- **BYOK** - Bring Your Own API Keys
- **No Cloud Sync** - Zero data sent to external servers
- **Evidence Hashing** - SHA-256 for chain of custody

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Chrome/Chromium browser
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aegis-osint.git
   cd aegis-osint
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Load extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project

5. **Configure API keys**
   - Click the AegisOSINT icon in Chrome
   - Click Settings (gear icon)
   - Add your API keys
   - Click "Save Settings"

---

## 📖 Usage

### Basic Investigation
1. Click the AegisOSINT extension icon
2. Type your query: `"Find information about John Doe in New York"`
3. The Inquisitor will ask clarifying questions if needed
4. Review results from multiple sources

### Quick Actions
Use pre-filled templates for common tasks:
- 🔍 **Search Person** - Find information about someone
- 📧 **Check Breach** - Check if email appears in data breaches
- 🐙 **GitHub Patch** - Extract emails from GitHub commits

### Keyboard Shortcuts
- `Enter` - Send message
- `Shift+Enter` - New line in message
- `Ctrl+K` - Focus search input

---

## 🏗️ Project Structure

```
d:/Aegis/
├── manifest.json              # Chrome extension manifest
├── vite.config.js            # Vite build configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── package.json              # npm dependencies
├── docs/                     # Documentation
│   ├── README.md            # Documentation index
│   ├── PHASE_1_FOUNDATION.md
│   ├── PHASE_2_AGENT_SYSTEM.md
│   └── PHASE_3_DATA_ACQUISITION.md
├── public/
│   └── icons/               # Extension icons
└── src/
    ├── background/          # Service worker
    │   └── index.js
    ├── content/             # Content scripts
    │   └── index.js
    ├── sidepanel/           # React UI
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── ChatInterface.jsx
    │   │   ├── MessageList.jsx
    │   │   ├── SettingsModal.jsx
    │   │   └── Sidebar.jsx
    │   └── store/
    │       └── useStore.js  # Zustand state management
    ├── lib/
    │   ├── utils/
    │   │   ├── helpers.js
    │   │   └── storage.js
    │   ├── llm/
    │   │   └── gemini-client.js
    │   └── apis/
    │       ├── tavily-client.js
    │       ├── social-intel.js
    │       └── hibp-client.js
    └── agents/
        ├── inquisitor.js
        ├── scout.js
        └── prompts.js
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | React 19 + Vite |
| **Styling** | Tailwind CSS + Custom Glassmorphism |
| **State Management** | Zustand with persistence |
| **Extension** | Chrome Manifest V3 |
| **AI/LLM** | Google Gemini 1.5 Pro (via Vercel AI SDK) |
| **Icons** | Lucide React |
| **Build Tool** | Vite + @crxjs/vite-plugin |

---

## 📋 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

### Code Quality
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **JSDoc** - Type hints and documentation

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Chrome extension boilerplate
- [x] React UI with Tailwind CSS
- [x] Zustand state management
- [x] Premium glassmorphism design

### Phase 2: Agent System (In Progress)
- [ ] Gemini API integration
- [ ] The Inquisitor agent
- [ ] Streaming responses
- [ ] Intent classification

### Phase 3: Data Acquisition
- [ ] Tavily search integration
- [ ] Social media APIs
- [ ] GitHub Patch Trick
- [ ] Breach data checking

### Phase 4: Verification
- [ ] The Auditor agent
- [ ] Conflict detection
- [ ] Confidence scoring

### Phase 5: Visualization
- [ ] Knowledge graph
- [ ] Timeline view
- [ ] Entity relationships

### Phase 6: Advanced Features
- [ ] Dark web monitoring
- [ ] Evidence preservation
- [ ] PDF reporting
- [ ] STIX export

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

AegisOSINT is designed for legitimate OSINT research and investigations. Users are responsible for ensuring their use complies with applicable laws and regulations. The developers assume no liability for misuse.

---

## 🙏 Acknowledgments

- [Gemini API](https://ai.google.dev/) - AI/LLM capabilities
- [Tavily AI](https://tavily.com/) - Web search
- [HaveIBeenPwned](https://haveibeenpwned.com/) - Breach data
- [Lucide Icons](https://lucide.dev/) - Beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

<div align="center">

**Built with ❤️ for the OSINT community**

[Documentation](docs/README.md) • [Report Bug](https://github.com/yourusername/aegis-osint/issues) • [Request Feature](https://github.com/yourusername/aegis-osint/issues)

</div>
