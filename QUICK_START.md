# CODEDIT - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Application
```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Terminal WebSocket**: ws://localhost:3001/terminal

### 2. Open in Browser
Navigate to **http://localhost:5173** in your web browser (Chrome, Edge, or Firefox recommended).

---

## 📸 Visual Guide

### Welcome Screen
When you first open CODEDIT, you'll see a professional welcome screen with:
- **Open Folder** button - Browse and open an existing project
- **New File** button - Start coding immediately with a blank file
- Feature highlights and keyboard shortcuts

![Welcome Screen](See generated image above)

### Main Interface
Once you open a file or folder, you'll see:
- **Title Bar** (top): Logo, project name, settings, window controls
- **Activity Bar** (left edge): Quick access to Explorer, Search, Git, AI
- **Sidebar** (left): File explorer with folder tree
- **Editor** (center): Monaco editor with tabs and breadcrumb
- **AI Assistant** (right): Chat interface for code help
- **Terminal** (bottom): Integrated PowerShell/CMD/Bash
- **Status Bar** (bottom): Git, language, cursor position

![Main Interface](See generated image above)

---

## 🎛️ All Working Features

### ✅ Window Controls (Top Right)
- **⚙️ Settings**: Opens comprehensive settings modal
- **➖ Minimize**: Minimizes window (or enters fullscreen in browser)
- **⬜ Maximize**: Toggles fullscreen mode
- **✖️ Close**: Closes application with confirmation

### ✅ Settings Modal
Access via Settings button or keyboard shortcut. Includes:

**Appearance**
- Theme: Dark / Light
- Font Size: 12px - 20px

**Editor**
- Auto Save
- Word Wrap
- Minimap

**Terminal**
- Default Shell: PowerShell / CMD / Bash

**AI Assistant**
- Auto-suggestions

All settings are saved automatically to localStorage!

### ✅ Collapsible Panels

**Sidebar (File Explorer)**
- Toggle Button: "◀ Hide Sidebar" / "▶ Show Sidebar"
- Keyboard: `Ctrl+B`
- Shows file tree when folder is opened

**AI Chat Assistant**
- Toggle Button: "Hide AI ▶" / "◀ Show AI"
- Keyboard: `Ctrl+Shift+C`
- AI-powered code assistance

**Terminal**
- Toggle Button: In editor toolbar
- Keyboard: `Ctrl+\``
- Supports multiple shells and tabs

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open Command Palette |
| `Ctrl+S` | Save File |
| `Ctrl+B` | Toggle Sidebar |
| `Ctrl+\`` | Toggle Terminal |
| `Ctrl+Shift+C` | Toggle AI Chat |
| `Ctrl+Shift+E` | Open Explorer |
| `Ctrl+Shift+F` | Open Search |
| `Ctrl+Shift+G` | Open Source Control |
| `Ctrl+Shift+A` | Open AI Agents |

---

## 🔧 Terminal Usage

### Creating Terminals
1. Terminal opens automatically when you start the app
2. Click **PowerShell** or **CMD** buttons to create new terminals
3. Multiple terminal instances supported

### Terminal Features
- ✅ Full shell integration (PowerShell, CMD, Bash)
- ✅ Multiple terminal tabs
- ✅ Clear terminal button
- ✅ WebSocket-based real-time communication
- ✅ Auto-reconnection on disconnect

### Troubleshooting Terminal
If terminal shows "Connection Error":
1. Make sure server is running (`npm run dev`)
2. Check that port 3001 is not blocked
3. Click "Retry Connection" button
4. Check browser console for WebSocket errors

---

## 📁 File Management

### Opening a Folder
1. Click **Open Folder** button (welcome screen or title bar)
2. Select a folder from your file system
3. Files appear in the sidebar
4. Click any file to open in editor

### Creating Files/Folders
1. Click **+** icons in file explorer header
2. Enter name and press Enter
3. Files are created in the selected folder

### Editing Files
1. Click file in sidebar to open
2. Edit in Monaco editor
3. Press `Ctrl+S` to save
4. Tab shows dot (•) when file has unsaved changes

---

## 🤖 AI Assistant

### Using AI Chat
1. AI panel is on the right side
2. Type your question or request
3. AI can:
   - Generate code
   - Explain code
   - Refactor code
   - Fix bugs
   - Create entire projects

### AI Features
- Context-aware (knows your current file)
- Code insertion
- Multi-file project generation
- Syntax highlighting in responses

---

## 🎨 Customization

### Changing Theme
1. Click Settings (⚙️) in title bar
2. Select **Appearance** → **Theme**
3. Choose Dark or Light
4. Changes apply immediately

### Adjusting Font Size
1. Open Settings
2. Select **Appearance** → **Font Size**
3. Choose from 12px to 20px

### Terminal Shell
1. Open Settings
2. Select **Terminal** → **Default Shell**
3. Choose PowerShell, CMD, or Bash

---

## 💡 Pro Tips

1. **Maximize Screen Space**: Hide sidebar (`Ctrl+B`) and AI chat (`Ctrl+Shift+C`) when coding
2. **Quick File Access**: Use Command Palette (`Ctrl+K`) for fast navigation
3. **Multiple Terminals**: Create separate terminals for different tasks
4. **Persistent Settings**: Your preferences are saved automatically
5. **Keyboard First**: Learn shortcuts for faster workflow

---

## 🐛 Common Issues

### Terminal Not Connecting
**Solution**: Ensure server is running with `npm run dev`

### Settings Not Saving
**Solution**: Check browser localStorage permissions

### File Changes Not Saving
**Solution**: Press `Ctrl+S` or enable Auto Save in settings

### Sidebar/AI Chat Not Showing
**Solution**: Use toggle buttons or keyboard shortcuts to show them

---

## 📊 System Requirements

- **Browser**: Chrome, Edge, Firefox (latest versions)
- **Node.js**: v14 or higher
- **OS**: Windows, macOS, Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for node_modules

---

## 🎉 You're All Set!

CODEDIT is now fully functional with:
- ✅ Professional welcome screen
- ✅ Working window controls
- ✅ Comprehensive settings
- ✅ Collapsible panels
- ✅ Integrated terminal
- ✅ AI assistance
- ✅ All buttons functional

**Enjoy coding with CODEDIT!** 🚀
