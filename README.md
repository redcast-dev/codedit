# CODEDIT — Professional AI Code Editor

<div align="center">

**A world-class, professional AI coding studio**  
*Comparable to Visual Studio Code in UI depth and Cursor/Windsurf/Antigravity in AI-first UX*

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![TypeScript](https://img.shields.io/badge/Monaco-Latest-007acc)

</div>

---

## 🎯 Vision

CODEDIT is an **AI-native coding studio**, not just an editor. It feels fast, intelligent, minimal, and powerful — something developers trust for real production work.

### Design Philosophy
- **VS Code-level UI depth** — Professional layout, activity bar, tabs, breadcrumbs, status bar
- **Cursor/Windsurf AI-first UX** — Context-aware AI that understands your entire project
- **Production-ready** — Built for real development work, not demos

---

## ✨ Features

### 🎨 Professional UI (VS Code-Inspired)

#### Layout
- **Activity Bar** (left edge) — Quick access to Explorer, Search, Git, AI Agents, Extensions
- **Sidebar Panels** — File Explorer with Git status, Search, Source Control, AI Agents
- **Title Bar** — Project name, Git branch, window controls
- **Editor Area** — Monaco Editor with tabs, breadcrumbs, split panes
- **Bottom Panel** — Integrated terminal, Problems, Output, Debug Console
- **Status Bar** — Git status, errors/warnings, language, cursor position, online status
- **Right Panel** — AI Chat Studio with context-aware assistance

#### Visual Design
- **Dark+ Theme** — Professional VS Code dark theme (default)
- **Light Theme** — Clean light theme option
- **Professional Typography** — Inter for UI, JetBrains Mono for code
- **Smooth Animations** — Subtle micro-animations for premium feel
- **Custom Scrollbars** — Styled scrollbars matching VS Code
- **Icon System** — Lucide React icons throughout

### 🤖 AI-First Experience (Cursor × Windsurf × Antigravity)

#### Context-Aware AI
- Understands open files and project structure
- Tracks selected code and cursor position
- Analyzes Git history
- Reads terminal errors automatically

#### AI Capabilities
- **Code Generation** — Generate code from natural language
- **Smart Refactoring** — AI-powered code improvements
- **Bug Detection & Fixes** — Automatic bug finding and fixing
- **Test Generation** — Create unit tests automatically
- **Code Explanation** — Understand complex code easily
- **Documentation** — Auto-generate comments and docs
- **Project Scaffolding** — Generate entire project structures

#### Inline Intelligence
- Ghost text suggestions (Copilot-style) — *Coming soon*
- Inline error explanations — *Coming soon*
- One-click "Fix with AI" — *Coming soon*
- Diff preview before applying changes — *Coming soon*

### 🎮 Command Palette (Pro Mode)

Access everything via natural language commands:
- "Fix this file"
- "Explain error"
- "Refactor to clean architecture"
- "Generate tests"
- "Commit with message"

**Keyboard Shortcuts:**
- `Ctrl+K` / `Cmd+K` — Open command palette
- `Ctrl+S` / `Cmd+S` — Save file
- `Ctrl+\`` — Toggle terminal
- `Ctrl+Shift+E` — Explorer
- `Ctrl+Shift+F` — Search
- `Ctrl+Shift+G` — Source Control
- `Ctrl+Shift+A` — AI Agents

### 🔧 Advanced Features

#### Editor
- **Monaco Editor** — Full VS Code editor engine
- **Multi-file Support** — Work with multiple files simultaneously
- **Syntax Highlighting** — Support for 50+ languages
- **IntelliSense** — Code completion and suggestions
- **Tab System** — Professional tabs with dirty indicators

#### Terminal
- **Integrated Terminal** — Built-in terminal with xterm.js
- **Multi-tab Support** — Multiple terminal instances — *Coming soon*
- **Shell Selection** — bash, zsh, PowerShell — *Coming soon*
- **AI Error Reading** — AI automatically reads and suggests fixes — *Coming soon*

#### File System
- **Local Folder Support** — Open real folders from your computer
- **File System Access API** — Read/write files directly
- **Virtual File System** — In-memory file system for quick prototyping
- **Folder Creation** — Create nested folder structures

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16+ and npm
- **Modern Browser** — Chrome, Edge, or Chromium-based (for File System Access API)
- **AI API Key** — OpenAI, Anthropic, or other (optional for AI features)

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd codedit
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env and add your API keys
```

4. **Start development server:**
```bash
npm run dev
```

This will start:
- Frontend (Vite): `http://localhost:5173`
- Backend (Express): `http://localhost:3001`

5. **Open in browser:**
```
http://localhost:5173
```

---

## 📁 Project Structure

```
codedit/
├── src/
│   ├── components/
│   │   ├── ActivityBar.jsx       # Left edge activity bar
│   │   ├── TitleBar.jsx          # Top title bar
│   │   ├── StatusBar.jsx         # Bottom status bar
│   │   ├── EditorTabs.jsx        # Editor tab system
│   │   ├── Breadcrumb.jsx        # File path breadcrumb
│   │   ├── FileExplorer.jsx      # File tree sidebar
│   │   ├── Editor.jsx            # Monaco editor wrapper
│   │   ├── AIChatStudio.jsx      # AI chat interface
│   │   ├── Terminal.jsx          # Integrated terminal
│   │   └── CommandPalette.jsx    # Command palette
│   ├── lib/
│   │   ├── utils.js              # Utility functions
│   │   ├── theme.js              # Theme system
│   │   ├── fs.js                 # Virtual file system
│   │   └── fileSystemManager.js  # Local file system manager
│   ├── App.jsx                   # Legacy app (for reference)
│   ├── App.professional.jsx      # New professional app
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── server/
│   ├── index.js                  # Express server
│   └── routes/
│       ├── chat.js               # AI chat endpoint
│       ├── generate.js           # Code generation
│       ├── refactor.js           # Code refactoring
│       └── terminal.js           # Terminal WebSocket
├── package.json
└── README.md
```

---

## 🎨 UI Components

### Activity Bar
Professional left-edge navigation with icons and tooltips.

### Title Bar
Top bar with project name, Git branch, and window controls.

### Status Bar
Bottom bar with Git status, errors, language, cursor position.

### Editor Tabs
VS Code-style tabs with close buttons and dirty indicators.

### Breadcrumb
File path navigation with clickable segments.

### AI Chat Studio
Right panel with context-aware AI assistance and code blocks.

---

## 🤖 AI Integration

### Backend API Endpoints

**Chat with AI:**
```
POST /api/ai/chat
Body: {
  messages: [{role, content}],
  context: {currentCode, language, files}
}
Response: {content, code?}
```

**Generate Code:**
```
POST /api/ai/generate
Body: {prompt, language, context}
Response: {code, explanation}
```

**Refactor Code:**
```
POST /api/ai/refactor
Body: {code, request}
Response: {refactoredCode, notes}
```

### AI Context System

The AI has access to:
- Current file content
- All open files
- Project structure
- Selected code
- Terminal output (coming soon)
- Git history (coming soon)

---

## 🎯 Roadmap

### Phase 1: UI/UX Architecture ✅
- [x] Activity Bar
- [x] Title Bar
- [x] Status Bar
- [x] Editor Tabs
- [x] Breadcrumb
- [x] Professional themes

### Phase 2: AI-First Experience ✅
- [x] AI Chat Studio
- [x] Context-aware AI
- [x] Code application
- [ ] Inline suggestions
- [ ] Diff preview

### Phase 3: Multi-Agent System 🚧
- [ ] Code Writer Agent
- [ ] Debugging Agent
- [ ] Refactoring Agent
- [ ] Test Generator Agent
- [ ] Documentation Agent

### Phase 4: GitHub Integration 📋
- [ ] OAuth login
- [ ] Clone repositories
- [ ] Commit/Push/Pull
- [ ] Branch management
- [ ] PR assistance

### Phase 5: Advanced Features 📋
- [ ] Split editor panes
- [ ] Multi-tab terminal
- [ ] Debugging UI
- [ ] Search & Replace
- [ ] Extensions system

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start dev server (frontend + backend)
npm run dev:client   # Start frontend only
npm run dev:server   # Start backend only
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Editor:** Monaco Editor (VS Code engine)
- **Terminal:** xterm.js
- **Icons:** Lucide React
- **UI Components:** Radix UI
- **Backend:** Express.js, WebSocket
- **AI:** OpenAI API / Anthropic Claude

---

## 🔒 Security

⚠️ **Important Security Notes:**

- Never call AI providers directly from the browser
- All AI requests are proxied through the backend
- API keys are stored server-side only
- Rate limiting implemented on all endpoints
- Code execution in sandboxed environments (coming soon)

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **VS Code** — UI/UX inspiration
- **Cursor** — AI-first coding experience
- **Windsurf** — Intelligent code assistance
- **Antigravity** — Advanced AI integration

---

## 📧 Contact

For questions, issues, or contributions, please open an issue on GitHub.

---

<div align="center">

**Built with ❤️ for developers who demand excellence**

</div>
