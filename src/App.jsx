import { useEffect, useState } from "react";
import FileExplorer from "./components/FileExplorer";
import EditorComponent from "./components/Editor";
import AIChat from "./components/AIChat";
import CommandPalette from "./components/CommandPalette";
import Terminal from "./components/Terminal";
import { uid, defaultFiles } from "./lib/fs";
import { fileSystemManager } from "./lib/fileSystemManager";

export default function App() {
  const [files, setFiles] = useState(defaultFiles);
  const [folders, setFolders] = useState([]);
  const [fileTree, setFileTree] = useState([]); // Tree structure for nested view
  const [activeFile, setActiveFile] = useState(Object.keys(defaultFiles)[0]);
  const [editorValue, setEditorValue] = useState(
    files[Object.keys(defaultFiles)[0]]?.content || ""
  );
  const [theme, setTheme] = useState("vs-dark");
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [codeHistory, setCodeHistory] = useState([]); // Track code changes for revert
  const [currentFolder, setCurrentFolder] = useState(null); // Current opened folder path
  const [useLocalFileSystem, setUseLocalFileSystem] = useState(false); // Whether using local FS

  useEffect(() => {
    // when activeFile changes, update editorValue
    setEditorValue(files[activeFile]?.content || "");
  }, [activeFile, files]);

  useEffect(() => {
    // Keyboard shortcuts
    function handleKeyDown(e) {
      // Ctrl+K or Cmd+K for command palette
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Ctrl+` for terminal
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setShowTerminal((prev) => !prev);
      }
      // Ctrl+S for save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editorValue, activeFile]);

  function updateFileContent(name, content) {
    setFiles((prev) => ({ ...prev, [name]: { ...prev[name], content } }));
    setEditorValue(content);
  }

  function handleEditorChange(value) {
    setEditorValue(value);
  }

  function saveToHistory(fileName, content) {
    setCodeHistory((prev) => [
      ...prev,
      {
        fileName,
        content,
        timestamp: Date.now(),
      },
    ]);
  }

  async function handleSave() {
    updateFileContent(activeFile, editorValue);
    
    // If using local file system, write to disk
    if (useLocalFileSystem && fileSystemManager.getDirectoryHandle()) {
      try {
        await fileSystemManager.writeFile(activeFile, editorValue);
        console.log(`Saved ${activeFile} to local storage`);
      } catch (err) {
        console.error('Error saving to local storage:', err);
        alert('Failed to save file to local storage: ' + err.message);
      }
    }
  }

  async function handleCreate(customName, parentPath = '') {
    const newName = customName || `file_${Object.keys(files).length + 1}.js`;
    const ext = newName.split(".").pop();
    const languageMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
    };
    const language = languageMap[ext] || "javascript";
    const initialContent = `// ${newName}`;
    
    // If using local file system, create file on disk
    if (useLocalFileSystem && fileSystemManager.getDirectoryHandle()) {
      try {
        const newFile = await fileSystemManager.createFile(newName, initialContent, parentPath);
        const fullPath = newFile.path;
        setFiles((prev) => ({
          ...prev,
          [fullPath]: newFile,
        }));
        setActiveFile(fullPath);
        // Reload tree
        await reloadFileTree();
        return;
      } catch (err) {
        console.error('Error creating file in local storage:', err);
        alert('Failed to create file in local storage: ' + err.message);
        return;
      }
    }
    
    // Fallback to in-memory
    const fullPath = parentPath ? `${parentPath}/${newName}` : newName;
    setFiles((prev) => ({
      ...prev,
      [fullPath]: { id: uid("f"), name: newName, path: fullPath, language, content: initialContent, type: "file" },
    }));
    setActiveFile(fullPath);
  }

  async function handleDelete(name) {
    // If using local file system, delete from disk
    if (useLocalFileSystem && fileSystemManager.getDirectoryHandle()) {
      try {
        const deleted = await fileSystemManager.deleteFile(name);
        if (deleted) {
          console.log('Deleted file:', name);
        } else {
          console.log('File did not exist:', name);
        }
      } catch (err) {
        console.error('Error deleting file from local storage:', err);
        alert('Failed to delete file from local storage: ' + err.message);
        return;
      }
    }
    
    const cp = { ...files };
    delete cp[name];
    setFiles(cp);
    const remaining = Object.keys(cp)[0];
    if (remaining) {
      setActiveFile(remaining);
    }
  }

  async function handleInsert(code, name = `snippet_${Date.now()}.js`) {
    // Save current state to history before inserting
    if (activeFile && files[activeFile]) {
      saveToHistory(activeFile, files[activeFile].content);
    }
    
    // Insert file into fs
    const shortName = name || `snippet_${Date.now()}.js`;
    setFiles((prev) => ({
      ...prev,
      [shortName]: { id: uid("f"), name: shortName, language: "javascript", content: code },
    }));
    setActiveFile(shortName);
  }

  function handleRevert() {
    if (codeHistory.length === 0) return;
    
    const lastState = codeHistory[codeHistory.length - 1];
    updateFileContent(lastState.fileName, lastState.content);
    setCodeHistory((prev) => prev.slice(0, -1));
  }

  async function handleApplyCode(code) {
    // Save current state before applying AI-generated code
    if (activeFile && files[activeFile]) {
      saveToHistory(activeFile, files[activeFile].content);
    }
    updateFileContent(activeFile, code);
    
    // Auto-save to local storage if enabled
    if (useLocalFileSystem && fileSystemManager.getDirectoryHandle()) {
      try {
        await fileSystemManager.writeFile(activeFile, code);
      } catch (err) {
        console.error('Error saving AI code to local storage:', err);
      }
    }
  }

  async function reloadFileTree() {
    if (!fileSystemManager.getDirectoryHandle()) return;
    
    try {
      const { files: loadedFiles, folders: loadedFolders, tree } = await fileSystemManager.readFolder();
      setFiles(loadedFiles);
      setFolders(loadedFolders);
      setFileTree(tree);
    } catch (err) {
      console.error('Error reloading file tree:', err);
    }
  }

  async function handleOpenFolder() {
    if (!fileSystemManager.isFileSystemAccessSupported()) {
      alert('File System Access API is not supported in your browser. Please use Chrome, Edge, or another Chromium-based browser.');
      return;
    }

    try {
      const dirHandle = await fileSystemManager.openFolder();
      if (!dirHandle) return; // User cancelled

      const { files: loadedFiles, folders: loadedFolders, tree } = await fileSystemManager.readFolder(dirHandle);
      
      setFiles(loadedFiles);
      setFolders(loadedFolders);
      setFileTree(tree);
      setCurrentFolder(dirHandle.name);
      setUseLocalFileSystem(true);
      
      // Set first file as active
      const firstFile = Object.keys(loadedFiles)[0];
      if (firstFile) {
        setActiveFile(firstFile);
      }
      
      console.log('Opened folder:', dirHandle.name);
    } catch (err) {
      console.error('Error opening folder:', err);
      alert('Failed to open folder: ' + err.message);
    }
  }

  async function handleCreateFolder(folderName, parentPath = '') {
    if (useLocalFileSystem && fileSystemManager.getDirectoryHandle()) {
      try {
        const newFolder = await fileSystemManager.createFolder(folderName, parentPath);
        setFolders((prev) => [...prev, newFolder]);
        console.log('Created folder:', folderName);
        // Reload tree
        await reloadFileTree();
      } catch (err) {
        console.error('Error creating folder:', err);
        alert('Failed to create folder: ' + err.message);
      }
    } else {
      // In-memory folder creation (just for display)
      const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
      setFolders((prev) => [
        ...prev,
        { id: uid("folder"), name: folderName, path: fullPath, type: "folder", children: [] },
      ]);
    }
  }

  async function handleDeleteFolder(folderName) {
    if (useLocalFileSystem && fileSystemManager.getDirectoryHandle()) {
      try {
        const deleted = await fileSystemManager.deleteFolder(folderName);
        setFolders((prev) => prev.filter((f) => f.name !== folderName));
        if (deleted) {
          console.log('Deleted folder:', folderName);
        } else {
          console.log('Folder did not exist:', folderName);
        }
      } catch (err) {
        console.error('Error deleting folder:', err);
        alert('Failed to delete folder: ' + err.message);
      }
    } else {
      setFolders((prev) => prev.filter((f) => f.name !== folderName));
    }
  }

  async function handleGenerateProject(project) {
    if (!project || !project.files) return;
    
    try {
      // If local file system is active, create files on disk
      if (useLocalFileSystem && fileSystemManager.getDirectoryHandle()) {
        for (const file of project.files) {
          const pathParts = file.path.split('/');
          const fileName = pathParts.pop();
          const folderPath = pathParts.join('/');
          
          // Create nested folders if needed
          if (folderPath) {
            const folders = pathParts;
            let currentPath = '';
            for (const folder of folders) {
              try {
                await fileSystemManager.createFolder(folder, currentPath);
                currentPath = currentPath ? `${currentPath}/${folder}` : folder;
              } catch (e) {
                // Folder might already exist, continue
              }
            }
          }
          
          // Create the file
          const newFile = await fileSystemManager.createFile(fileName, file.content, folderPath);
          setFiles((prev) => ({
            ...prev,
            [newFile.path]: newFile,
          }));
        }
        
        // Reload tree to show new structure
        await reloadFileTree();
        
        // Count folders created
        const folderCount = new Set(
          project.files
            .map(f => f.path.split('/').slice(0, -1).join('/'))
            .filter(p => p)
        ).size;
        
        alert(`✅ Successfully created ${project.files.length} files${folderCount > 0 ? ` and ${folderCount} folders` : ''} in your workspace!`);
      } else {
        // In-memory mode: create folder structure and files
        const newFiles = {};
        const newFolders = [];
        const folderSet = new Set();
        
        // First pass: collect all folders
        project.files.forEach(file => {
          const pathParts = file.path.split('/');
          if (pathParts.length > 1) {
            // Has folders
            let currentPath = '';
            for (let i = 0; i < pathParts.length - 1; i++) {
              const folderName = pathParts[i];
              const parentPath = currentPath;
              currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;
              
              if (!folderSet.has(currentPath)) {
                folderSet.add(currentPath);
                newFolders.push({
                  id: uid('folder'),
                  name: folderName,
                  path: currentPath,
                  type: 'folder',
                  children: []
                });
              }
            }
          }
        });
        
        // Second pass: create files
        project.files.forEach(file => {
          const ext = file.path.split('.').pop();
          const languageMap = {
            js: 'javascript',
            jsx: 'javascript',
            ts: 'typescript',
            tsx: 'typescript',
            html: 'html',
            css: 'css',
            json: 'json',
            md: 'markdown',
          };
          const language = languageMap[ext] || 'javascript';
          
          newFiles[file.path] = {
            id: uid('f'),
            name: file.path.split('/').pop(),
            path: file.path,
            language,
            content: file.content,
            type: 'file',
          };
        });
        
        // Update state
        setFolders((prev) => [...prev, ...newFolders]);
        setFiles((prev) => ({ ...prev, ...newFiles }));
        
        // Set first file as active
        const firstFile = Object.keys(newFiles)[0];
        if (firstFile) {
          setActiveFile(firstFile);
        }
        
        alert(`✅ Created ${project.files.length} files and ${newFolders.length} folders!\n\n💡 Tip: Open a local folder to save them to disk.`);
      }
    } catch (err) {
      console.error('Error generating project:', err);
      
      // Handle specific file system errors
      if (err.message.includes('Directory access expired') || 
          err.message.includes('state cached in an interface object')) {
        // Clear stale handles
        fileSystemManager.clearHandles();
        setUseLocalFileSystem(false);
        setCurrentFolder(null);
        
        alert('⚠️ Directory access expired. The folder connection was lost.\n\n' +
              '📁 Please click "Open Folder" again to reconnect, then try creating the project again.\n\n' +
              '💡 Tip: This can happen if the folder was moved, renamed, or if browser permissions expired.');
      } else {
        alert('Failed to generate project: ' + err.message);
      }
    }
  }

  function handleCommand(commandId) {
    switch (commandId) {
      case "new-file":
        handleCreate();
        break;
      case "save":
        handleSave();
        break;
      case "delete-file":
        if (activeFile) handleDelete(activeFile);
        break;
      case "toggle-theme":
        setTheme((t) => (t === "vs-dark" ? "light" : "vs-dark"));
        break;
      case "toggle-terminal":
        setShowTerminal((prev) => !prev);
        break;
      case "revert-code":
        handleRevert();
        break;
      default:
        console.log("Command:", commandId);
    }
  }

  const active = files[activeFile];
  const languageForEditor = active?.language === "html" ? "html" : active?.language || "javascript";

  return (
    <div className="h-screen flex flex-col font-sans bg-gray-50">
      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommand}
      />

      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CODEDIT
          </div>
          <div className="text-sm text-gray-500">AI-Powered Code Editor</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50 flex items-center gap-2"
            onClick={() => setShowCommandPalette(true)}
            title="Command Palette (Ctrl+K)"
          >
            <span>⌘</span> Commands
          </button>
          <button
            className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50"
            onClick={() => setTheme((t) => (t === "vs-dark" ? "light" : "vs-dark"))}
            title="Toggle Theme"
          >
            {theme === "vs-dark" ? "🌙" : "☀️"}
          </button>
          <button
            className="text-sm px-3 py-1.5 border rounded hover:bg-gray-50"
            onClick={handleRevert}
            disabled={codeHistory.length === 0}
            title="Revert Last Change"
          >
            ↩️ Revert ({codeHistory.length})
          </button>
          <button
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSave}
            title="Save (Ctrl+S)"
          >
            💾 Save
          </button>
        </div>
      </div>

      {/* Main area - 3 panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: File Explorer */}
        <div className="w-72 border-r shadow-sm flex flex-col">
          <FileExplorer
            files={files}
            folders={folders}
            fileTree={fileTree}
            activeFile={activeFile}
            onSelect={(n) => setActiveFile(n)}
            onCreate={handleCreate}
            onDelete={handleDelete}
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolder}
            onOpenFolder={handleOpenFolder}
            currentFolder={currentFolder}
          />
        </div>

        {/* Center: Editor + Terminal (fixed at bottom) */}
        <div className="flex-1 flex flex-col">
          {/* Editor header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{activeFile}</span>
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{active?.language}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500">Monaco: {languageForEditor}</div>
              <button
                onClick={() => setShowTerminal((prev) => !prev)}
                className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                title="Toggle Terminal (Ctrl+`)"
              >
                {showTerminal ? "Hide" : "Show"} Terminal
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className={showTerminal ? "flex-1" : "flex-1"}>
            <EditorComponent
              language={languageForEditor}
              theme={theme}
              value={editorValue}
              onChange={handleEditorChange}
            />
          </div>

          {/* Terminal - Fixed at bottom */}
          {showTerminal && (
            <div className="h-64 border-t">
              <Terminal isVisible={true} onClose={() => setShowTerminal(false)} />
            </div>
          )}
        </div>

        {/* Right sidebar: AI Assistant only */}
        <div className="w-96 flex flex-col border-l bg-white shadow-sm">
          <AIChat
            code={editorValue}
            language={active?.language || "javascript"}
            files={files}
            onInsert={handleInsert}
            onApplyCode={handleApplyCode}
            onRevert={handleRevert}
            canRevert={codeHistory.length > 0}
            onGenerateProject={handleGenerateProject}
          />
        </div>
      </div>
    </div>
  );
}
