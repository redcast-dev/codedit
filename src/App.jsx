import { useState, useEffect } from 'react';
import ActivityBar from './components/ActivityBar';
import TitleBar from './components/TitleBar';
import StatusBar from './components/StatusBar';
import EditorTabs from './components/EditorTabs';
import Breadcrumb from './components/Breadcrumb';
import FileExplorer from './components/FileExplorer';
import EditorComponent from './components/Editor';
import AIChatStudio from './components/AIChatStudio';
import Terminal from './components/Terminal';
import CommandPalette from './components/CommandPalette';
import WelcomeScreen from './components/WelcomeScreen';
import SettingsModal from './components/SettingsModal';
import SearchPanel from './components/SearchPanel';
import SourceControlPanel from './components/SourceControlPanel';
import AIAgentsPanel from './components/AIAgentsPanel';
import ExtensionsPanel from './components/ExtensionsPanel';
import ApplicationMenu from './components/ApplicationMenu';
import { uid, defaultFiles } from './lib/fs';
import { fileSystemManager } from './lib/fileSystemManager';
import { getMonacoTheme } from './lib/theme';
import { getLanguageFromFilename } from './lib/utils';

/**
 * CODEDIT - Professional AI Code Editor
 * Inspired by VS Code UI + Cursor/Windsurf/Antigravity AI-first UX
 */
export default function App() {
    // Theme
    const [theme, setTheme] = useState('dark');

    // Settings
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({
        theme: 'dark',
        fontSize: '14',
        autoSave: false,
        wordWrap: false,
        minimap: true,
        defaultShell: 'powershell',
        aiSuggestions: true
    });

    // Panel visibility
    const [showSidebar, setShowSidebar] = useState(true);
    const [showAIChat, setShowAIChat] = useState(true);

    // File system
    const [files, setFiles] = useState(defaultFiles);
    const [folders, setFolders] = useState([]);
    const [fileTree, setFileTree] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [useLocalFileSystem, setUseLocalFileSystem] = useState(false);

    // Editor state
    const [openTabs, setOpenTabs] = useState([
        {
            id: Object.keys(defaultFiles)[0],
            name: Object.keys(defaultFiles)[0],
            language: defaultFiles[Object.keys(defaultFiles)[0]]?.language || 'javascript',
            isDirty: false
        }
    ]);
    const [activeTab, setActiveTab] = useState(Object.keys(defaultFiles)[0]);
    const [editorValue, setEditorValue] = useState(
        files[Object.keys(defaultFiles)[0]]?.content || ''
    );

    // UI state
    const [activeView, setActiveView] = useState('explorer');
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [showTerminal, setShowTerminal] = useState(true);
    const [showApplicationMenu, setShowApplicationMenu] = useState(false);

    // Code history for revert
    const [codeHistory, setCodeHistory] = useState([]);

    // Editor metadata
    const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
    const [totalLines, setTotalLines] = useState(0);

    // Update editor when active tab changes
    useEffect(() => {
        setEditorValue(files[activeTab]?.content || '');
    }, [activeTab, files]);

    // Keyboard shortcuts
    useEffect(() => {
        function handleKeyDown(e) {
            // Ctrl+K for command palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setShowCommandPalette(true);
            }
            // Ctrl+` for terminal
            if (e.ctrlKey && e.key === '`') {
                e.preventDefault();
                setShowTerminal(prev => !prev);
            }
            // Ctrl+S for save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            // Ctrl+B for sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                setShowSidebar(prev => !prev);
            }
            // Ctrl+Shift+C for AI chat
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                setShowAIChat(prev => !prev);
            }
            // Ctrl+Shift+E for explorer
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                setActiveView('explorer');
            }
            // Ctrl+Shift+F for search
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                setActiveView('search');
            }
            // Ctrl+Shift+G for source control
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') {
                e.preventDefault();
                setActiveView('source-control');
            }
            // Ctrl+Shift+A for AI agents
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                setActiveView('ai-agents');
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTab, editorValue]);

    // File operations
    function handleEditorChange(value) {
        setEditorValue(value);
        // Mark tab as dirty
        setOpenTabs(tabs =>
            tabs.map(tab =>
                tab.id === activeTab ? { ...tab, isDirty: true } : tab
            )
        );
    }

    async function handleSave() {
        updateFileContent(activeTab, editorValue);

        // Mark tab as clean
        setOpenTabs(tabs =>
            tabs.map(tab =>
                tab.id === activeTab ? { ...tab, isDirty: false } : tab
            )
        );

        // Save to local file system if enabled
        if (useLocalFileSystem && fileSystemManager.getDirectoryHandle()) {
            try {
                await fileSystemManager.writeFile(activeTab, editorValue);
                console.log(`Saved ${activeTab}`);
            } catch (err) {
                console.error('Error saving:', err);
            }
        }
    }

    function updateFileContent(name, content) {
        setFiles(prev => ({ ...prev, [name]: { ...prev[name], content } }));
    }

    async function handleFileSelect(filePath) {
        setActiveTab(filePath);

        // Add to open tabs if not already open
        if (!openTabs.find(tab => tab.id === filePath)) {
            const file = files[filePath];
            setOpenTabs(prev => [...prev, {
                id: filePath,
                name: file?.name || filePath,
                language: file?.language || getLanguageFromFilename(filePath),
                isDirty: false
            }]);
        }
    }

    function handleTabClose(tabId) {
        const newTabs = openTabs.filter(tab => tab.id !== tabId);
        setOpenTabs(newTabs);

        // If closing active tab, switch to another
        if (tabId === activeTab && newTabs.length > 0) {
            setActiveTab(newTabs[0].id);
        }
    }

    async function handleCreate(customName, content = null, parentPath = '') {
        let nameToCreate = customName;
        let pathToCreate = parentPath;

        if (customName && customName.includes('/')) {
            const parts = customName.split('/');
            nameToCreate = parts.pop();
            const relativePath = parts.join('/');
            pathToCreate = parentPath ? `${parentPath}/${relativePath}` : relativePath;
        }

        const newName = nameToCreate || `file_${Object.keys(files).length + 1}.js`;
        const language = getLanguageFromFilename(newName);
        const initialContent = content !== null ? content : `// ${newName}`;

        if (useLocalFileSystem && fileSystemManager.getDirectoryHandle()) {
            try {
                const newFile = await fileSystemManager.createFile(newName, initialContent, pathToCreate);
                const fullPath = newFile.path;
                setFiles(prev => ({ ...prev, [fullPath]: newFile }));
                handleFileSelect(fullPath);
                await reloadFileTree();
                return;
            } catch (err) {
                console.error('Error creating file:', err);
                return;
            }
        }

        const fullPath = pathToCreate ? `${pathToCreate}/${newName}` : newName;
        setFiles(prev => ({
            ...prev,
            [fullPath]: {
                id: uid('f'),
                name: newName,
                path: fullPath,
                language,
                content: initialContent,
                type: 'file'
            }
        }));
        handleFileSelect(fullPath);
    }

    async function handleDelete(name) {
        if (useLocalFileSystem && fileSystemManager.getDirectoryHandle()) {
            try {
                await fileSystemManager.deleteFile(name);
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }

        const cp = { ...files };
        delete cp[name];
        setFiles(cp);

        // Close tab if open
        handleTabClose(name);
    }

    async function handleOpenFolder() {
        if (!fileSystemManager.isFileSystemAccessSupported()) {
            alert('File System Access API not supported. Use Chrome/Edge.');
            return;
        }

        try {
            const dirHandle = await fileSystemManager.openFolder();
            if (!dirHandle) return;

            const { files: loadedFiles, folders: loadedFolders, tree } =
                await fileSystemManager.readFolder(dirHandle);

            setFiles(loadedFiles);
            setFolders(loadedFolders);
            setFileTree(tree);
            setCurrentFolder(dirHandle.name);
            setUseLocalFileSystem(true);

            const firstFile = Object.keys(loadedFiles)[0];
            if (firstFile) {
                handleFileSelect(firstFile);
            }
        } catch (err) {
            console.error('Error opening folder:', err);
        }
    }

    async function reloadFileTree() {
        if (!fileSystemManager.getDirectoryHandle()) return;

        try {
            const { files: loadedFiles, folders: loadedFolders, tree } =
                await fileSystemManager.readFolder();
            setFiles(loadedFiles);
            setFolders(loadedFolders);
            setFileTree(tree);
        } catch (err) {
            console.error('Error reloading:', err);
        }
    }

    function handleSettingsChange(newSettings) {
        setSettings(newSettings);
        // Apply theme change immediately
        if (newSettings.theme !== theme) {
            setTheme(newSettings.theme);
        }
        // Save to localStorage
        localStorage.setItem('codedit-settings', JSON.stringify(newSettings));
    }

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('codedit-settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings(parsed);
                if (parsed.theme) {
                    setTheme(parsed.theme);
                }
            } catch (err) {
                console.error('Error loading settings:', err);
            }
        }
    }, []);

    function handleCommand(commandId) {
        switch (commandId) {
            case 'new-file':
                handleCreate();
                break;
            case 'save':
                handleSave();
                break;
            case 'delete-file':
                if (activeTab) handleDelete(activeTab);
                break;
            case 'toggle-theme':
                const newTheme = theme === 'dark' ? 'light' : 'dark';
                setTheme(newTheme);
                setSettings(prev => ({ ...prev, theme: newTheme }));
                break;
            case 'toggle-terminal':
                setShowTerminal(prev => !prev);
                break;
            case 'toggle-sidebar':
                setShowSidebar(prev => !prev);
                break;
            case 'toggle-ai-chat':
                setShowAIChat(prev => !prev);
                break;
            default:
                console.log('Command:', commandId);
        }
    }

    function handleApplyCode(code) {
        // Save current code to history before applying new code
        setCodeHistory(prev => [...prev, {
            code: editorValue,
            file: activeTab,
            timestamp: new Date()
        }]);

        setEditorValue(code);
        updateFileContent(activeTab, code);
    }

    function handleRevert() {
        if (codeHistory.length === 0) return;

        const lastState = codeHistory[codeHistory.length - 1];
        setEditorValue(lastState.code);
        updateFileContent(activeTab, lastState.code);
        setCodeHistory(prev => prev.slice(0, -1));
    }

    function handleApplicationMenuAction(actionId) {
        switch (actionId) {
            case 'new-file':
                handleCreate('untitled.js');
                break;
            case 'open-folder':
                handleOpenFolder();
                break;
            case 'save':
                handleSave();
                break;
            case 'settings':
                setShowSettings(true);
                break;
            case 'about':
                alert('CODEDIT v1.0.0\nAI-Powered Professional Code Editor');
                break;
            case 'help':
                window.open('https://github.com/codedit/help', '_blank');
                break;
        }
    }

    const activeFile = files[activeTab];
    const languageForEditor = activeFile?.language || 'javascript';
    const showWelcome = !currentFolder && fileTree.length === 0;

    return (
        <div className="h-screen flex flex-col bg-[#1e1e1e] text-[#cccccc]">
            {/* Command Palette */}
            <CommandPalette
                isOpen={showCommandPalette}
                onClose={() => setShowCommandPalette(false)}
                onCommand={handleCommand}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                settings={settings}
                onSettingsChange={handleSettingsChange}
                theme={theme}
            />

            {/* Application Menu */}
            <ApplicationMenu
                isOpen={showApplicationMenu}
                onClose={() => setShowApplicationMenu(false)}
                theme={theme}
                onAction={handleApplicationMenuAction}
            />

            {/* Title Bar */}
            <TitleBar
                theme={theme}
                projectName={currentFolder || 'Untitled'}
                folderPath={currentFolder}
                onOpenFolder={handleOpenFolder}
                onSettings={() => setShowSettings(true)}
                onMenu={() => setShowApplicationMenu(true)}
                onMinimize={() => console.log('Minimize')}
                onMaximize={() => console.log('Maximize')}
                onClose={() => console.log('Close')}
            />

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Activity Bar */}
                <ActivityBar
                    activeView={activeView}
                    onViewChange={setActiveView}
                    theme={theme}
                />

                {/* Sidebar - Collapsible */}
                {showSidebar && (
                    <div className={`w-80 flex flex-col border-r ${theme === 'dark' ? 'bg-[#252526] border-[#1e1e1e]' : 'bg-[#f3f3f3] border-[#e5e5e5]'
                        }`}>
                        {activeView === 'explorer' && (
                            <FileExplorer
                                files={files}
                                folders={folders}
                                fileTree={fileTree}
                                activeFile={activeTab}
                                onSelect={handleFileSelect}
                                onCreate={handleCreate}
                                onDelete={handleDelete}
                                onOpenFolder={handleOpenFolder}
                                currentFolder={currentFolder}
                            />
                        )}
                        {activeView === 'search' && (
                            <SearchPanel
                                theme={theme}
                                files={files}
                                onFileSelect={handleFileSelect}
                            />
                        )}
                        {activeView === 'source-control' && (
                            <SourceControlPanel theme={theme} />
                        )}
                        {activeView === 'ai-agents' && (
                            <AIAgentsPanel
                                theme={theme}
                                onAgentSelect={(agentId) => {
                                    console.log('Selected agent:', agentId);
                                    setShowAIChat(true);
                                }}
                            />
                        )}
                        {activeView === 'extensions' && (
                            <ExtensionsPanel theme={theme} />
                        )}
                        {activeView === 'terminal' && (
                            <div className="p-4">
                                <div className="text-sm font-semibold mb-2">Terminal</div>
                                <div className="text-xs opacity-60">Use Ctrl+` to toggle terminal</div>
                            </div>
                        )}
                        {activeView === 'settings' && (
                            <div className="p-4">
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                >
                                    Open Settings
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Editor Area */}
                <div className="flex-1 flex flex-col">
                    {showWelcome ? (
                        <WelcomeScreen
                            onOpenFolder={handleOpenFolder}
                            onNewFile={() => handleCreate('untitled.js')}
                            theme={theme}
                        />
                    ) : (
                        <>
                            {/* Tabs */}
                            <EditorTabs
                                tabs={openTabs}
                                activeTab={activeTab}
                                onTabClick={setActiveTab}
                                onTabClose={handleTabClose}
                                theme={theme}
                            />

                            {/* Breadcrumb */}
                            <Breadcrumb
                                path={activeTab}
                                theme={theme}
                            />

                            {/* Toolbar for toggles */}
                            <div className={`flex items-center justify-between px-3 py-1 border-b ${theme === 'dark' ? 'bg-[#252526] border-[#1e1e1e]' : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowSidebar(prev => !prev)}
                                        className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'hover:bg-[#3c3c3c]' : 'hover:bg-gray-200'
                                            }`}
                                        title="Toggle Sidebar (Ctrl+B)"
                                    >
                                        {showSidebar ? '◀ Hide Sidebar' : '▶ Show Sidebar'}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowAIChat(prev => !prev)}
                                        className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'hover:bg-[#3c3c3c]' : 'hover:bg-gray-200'
                                            }`}
                                        title="Toggle AI Assistant"
                                    >
                                        {showAIChat ? 'Hide AI ▶' : '◀ Show AI'}
                                    </button>
                                </div>
                            </div>

                            {/* Editor */}
                            <div className="flex-1">
                                <EditorComponent
                                    language={languageForEditor}
                                    theme={getMonacoTheme(theme)}
                                    value={editorValue}
                                    onChange={handleEditorChange}
                                />
                            </div>

                            {/* Terminal */}
                            {showTerminal && (
                                <div className="h-64 border-t border-[#252526]">
                                    <Terminal isVisible={true} onClose={() => setShowTerminal(false)} />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* AI Chat Studio (Right Panel) - Collapsible */}
                {showAIChat && !showWelcome && (
                    <div className="w-96 border-l border-[#252526]">
                        <AIChatStudio
                            theme={theme}
                            code={editorValue}
                            language={languageForEditor}
                            files={files}
                            onApplyCode={handleApplyCode}
                            onCreateFile={handleCreate}
                            onRevert={handleRevert}
                        />
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <StatusBar
                theme={theme}
                gitBranch="main"
                gitStatus="synced"
                language={languageForEditor}
                lineNumber={cursorPosition.line}
                columnNumber={cursorPosition.column}
                totalLines={editorValue.split('\n').length}
                errors={0}
                warnings={0}
                isOnline={true}
                notifications={0}
            />
        </div>
    );
}
