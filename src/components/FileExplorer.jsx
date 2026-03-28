import { useState } from "react";
import FileTree from "./FileTree";

export default function FileExplorer({ 
  files, 
  folders = [], 
  activeFile, 
  onSelect, 
  onCreate, 
  onDelete,
  onCreateFolder,
  onDeleteFolder,
  onOpenFolder,
  currentFolder,
  fileTree = []
}) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFile, setCreatingFile] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      onCreate(newFileName.trim());
      setNewFileName("");
      setCreatingFile(false);
      setShowCreateMenu(false);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
      setCreatingFolder(false);
      setShowCreateMenu(false);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop();
    switch (ext) {
      case "js":
      case "jsx":
        return "📜";
      case "html":
        return "🌐";
      case "css":
        return "🎨";
      case "json":
        return "📋";
      case "md":
        return "📝";
      case "ts":
      case "tsx":
        return "📘";
      default:
        return "📄";
    }
  };

  const handleTreeCreateFile = (parentPath, fileName) => {
    onCreate(fileName, parentPath);
  };

  const handleTreeCreateFolder = (parentPath, folderName) => {
    onCreateFolder(folderName, parentPath);
  };

  const handleTreeDelete = (path, isFolder) => {
    if (isFolder) {
      onDeleteFolder(path);
    } else {
      onDelete(path);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#252526]">
      {/* Header - VS Code style */}
      <div className="px-2 py-2 border-b border-gray-700 bg-[#252526]">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Explorer</h3>
          <div className="flex gap-1">
            <button
              className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded"
              onClick={onOpenFolder}
              title="Open Folder"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
              </svg>
            </button>
            <button
              className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded"
              onClick={() => {
                setCreatingFile(true);
              }}
              title="New File"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd"/>
              </svg>
            </button>
            <button
              className="text-gray-400 hover:text-white hover:bg-gray-700 p-1 rounded"
              onClick={() => {
                setCreatingFolder(true);
              }}
              title="New Folder"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
              </svg>
            </button>
          </div>
        </div>
        {currentFolder && (
          <div className="text-xs text-gray-500 mt-2 truncate" title={currentFolder}>
            {currentFolder.toUpperCase()}
          </div>
        )}
        
        {/* Root level create file input */}
        {creatingFile && (
          <div className="mt-2 flex items-center h-7 bg-[#1e1e1e] border border-blue-500">
            <span className="text-sm ml-2 mr-2">📄</span>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleCreateFile();
                if (e.key === "Escape") {
                  setCreatingFile(false);
                  setNewFileName("");
                }
              }}
              onBlur={() => {
                if (newFileName.trim()) handleCreateFile();
                else {
                  setCreatingFile(false);
                  setNewFileName("");
                }
              }}
              placeholder="filename.js"
              className="flex-1 text-sm px-1 bg-transparent text-white border-none outline-none"
              autoFocus
            />
          </div>
        )}
        
        {/* Root level create folder input */}
        {creatingFolder && (
          <div className="mt-2 flex items-center h-7 bg-[#1e1e1e] border border-green-500">
            <span className="text-sm ml-2 mr-2">📁</span>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") {
                  setCreatingFolder(false);
                  setNewFolderName("");
                }
              }}
              onBlur={() => {
                if (newFolderName.trim()) handleCreateFolder();
                else {
                  setCreatingFolder(false);
                  setNewFolderName("");
                }
              }}
              placeholder="folder-name"
              className="flex-1 text-sm px-1 bg-transparent text-white border-none outline-none"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* File Tree - VS Code style */}
      <div className="flex-1 overflow-auto bg-[#252526] text-white">
        {fileTree.length > 0 ? (
          <FileTree
            items={fileTree}
            activeFile={activeFile}
            onSelect={onSelect}
            onDelete={handleTreeDelete}
            onCreateFile={handleTreeCreateFile}
            onCreateFolder={handleTreeCreateFolder}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            <div className="mb-2 text-2xl">📂</div>
            <div>No folder opened</div>
            <div className="text-xs mt-2">Click the folder icon above to open</div>
          </div>
        )}
      </div>

      {/* Footer info - VS Code style */}
      <div className="px-2 py-1 border-t border-gray-700 bg-[#252526] text-xs text-gray-500">
        {fileTree.length} item{fileTree.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
