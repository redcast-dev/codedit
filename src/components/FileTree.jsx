import { useState } from "react";

// File tree item component (recursive for nested folders)
function TreeItem({ 
  item, 
  level = 0, 
  activeFile, 
  onSelect, 
  onDelete,
  onCreateFile,
  onCreateFolder,
  expandedFolders,
  toggleFolder
}) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [creatingFile, setCreatingFile] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newName, setNewName] = useState("");

  const isFolder = item.type === 'folder';
  const isExpanded = expandedFolders.has(item.path || item.name);
  const indent = level * 16;

  const getFileIcon = (fileName) => {
    if (!fileName) return "📄";
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
      case "jsx":
        return "📜";
      case "ts":
      case "tsx":
        return "📘";
      case "html":
        return "🌐";
      case "css":
      case "scss":
      case "sass":
        return "🎨";
      case "json":
        return "📋";
      case "md":
        return "📝";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
        return "🖼️";
      case "env":
        return "⚙️";
      default:
        return "📄";
    }
  };

  const handleCreateFile = () => {
    if (newName.trim()) {
      onCreateFile(item.path || item.name, newName.trim());
      setNewName("");
      setCreatingFile(false);
      setShowContextMenu(false);
    }
  };

  const handleCreateFolder = () => {
    if (newName.trim()) {
      onCreateFolder(item.path || item.name, newName.trim());
      setNewName("");
      setCreatingFolder(false);
      setShowContextMenu(false);
    }
  };

  const handleKeyPress = (e, handler) => {
    if (e.key === "Enter") {
      handler();
    } else if (e.key === "Escape") {
      setNewName("");
      setCreatingFile(false);
      setCreatingFolder(false);
    }
  };

  return (
    <div className="relative">
      {/* Main item */}
      <div
        className={`group flex items-center h-7 cursor-pointer hover:bg-[#2a2d2e] ${
          !isFolder && activeFile === (item.path || item.name)
            ? "bg-[#37373d]"
            : ""
        }`}
        style={{ paddingLeft: `${indent + 4}px` }}
        onClick={() => {
          if (isFolder) {
            toggleFolder(item.path || item.name);
          } else {
            onSelect(item.path || item.name);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (isFolder) {
            setShowContextMenu(!showContextMenu);
          }
        }}
      >
        {/* Expand/collapse arrow for folders */}
        {isFolder && (
          <span className="w-4 h-4 flex items-center justify-center text-gray-400 text-xs mr-1">
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
        {!isFolder && <span className="w-4 mr-1"></span>}

        {/* Icon */}
        <span className="text-sm mr-2">
          {isFolder ? (isExpanded ? "📂" : "📁") : getFileIcon(item.name)}
        </span>

        {/* Name */}
        <span className="text-sm flex-1 truncate text-gray-200">{item.name}</span>

        {/* Actions (show on hover) */}
        {isFolder && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 mr-2">
            <button
              className="text-xs px-1 hover:bg-gray-600 rounded text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                setCreatingFile(true);
                setShowContextMenu(false);
                if (!isExpanded) {
                  toggleFolder(item.path || item.name);
                }
              }}
              title="New File"
            >
              📄
            </button>
            <button
              className="text-xs px-1 hover:bg-gray-600 rounded text-gray-300"
              onClick={(e) => {
                e.stopPropagation();
                setCreatingFolder(true);
                setShowContextMenu(false);
                if (!isExpanded) {
                  toggleFolder(item.path || item.name);
                }
              }}
              title="New Folder"
            >
              📁
            </button>
          </div>
        )}

        {/* Delete button for all items */}
        <button
          className="opacity-0 group-hover:opacity-100 text-xs px-1 hover:bg-red-900 text-red-400 rounded mr-1"
          onClick={(e) => {
            e.stopPropagation();
            const confirmMsg = isFolder
              ? `Delete folder "${item.name}" and all its contents?`
              : `Delete file "${item.name}"?`;
            if (confirm(confirmMsg)) {
              onDelete(item.path || item.name, isFolder);
            }
          }}
          title="Delete"
        >
          🗑️
        </button>
      </div>

      {/* Context menu */}
      {showContextMenu && isFolder && (
        <div className="absolute left-0 mt-1 bg-[#3c3c3c] border border-gray-600 shadow-lg rounded z-10 text-sm"
             style={{ marginLeft: `${indent + 20}px` }}>
          <button
            className="w-full text-left px-3 py-1 hover:bg-[#2a2d2e] flex items-center gap-2 text-gray-200"
            onClick={() => {
              setCreatingFile(true);
              setShowContextMenu(false);
            }}
          >
            📄 New File
          </button>
          <button
            className="w-full text-left px-3 py-1 hover:bg-[#2a2d2e] flex items-center gap-2 text-gray-200"
            onClick={() => {
              setCreatingFolder(true);
              setShowContextMenu(false);
            }}
          >
            📁 New Folder
          </button>
        </div>
      )}

      {/* Create file input */}
      {creatingFile && isExpanded && (
        <div
          className="flex items-center h-7 bg-[#1e1e1e] border-l-2 border-blue-500"
          style={{ paddingLeft: `${indent + 20}px` }}
        >
          <span className="text-sm mr-2">📄</span>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, handleCreateFile)}
            onBlur={handleCreateFile}
            placeholder="filename.js"
            className="flex-1 text-sm px-1 py-0 border-none outline-none bg-transparent text-white"
            autoFocus
          />
        </div>
      )}

      {/* Create folder input */}
      {creatingFolder && isExpanded && (
        <div
          className="flex items-center h-7 bg-[#1e1e1e] border-l-2 border-green-500"
          style={{ paddingLeft: `${indent + 20}px` }}
        >
          <span className="text-sm mr-2">📁</span>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, handleCreateFolder)}
            onBlur={handleCreateFolder}
            placeholder="folder-name"
            className="flex-1 text-sm px-1 py-0 border-none outline-none bg-transparent text-white"
            autoFocus
          />
        </div>
      )}

      {/* Nested children (if folder is expanded) */}
      {isFolder && isExpanded && item.children && item.children.length > 0 && (
        <div>
          {item.children.map((child) => (
            <TreeItem
              key={child.path || child.name}
              item={child}
              level={level + 1}
              activeFile={activeFile}
              onSelect={onSelect}
              onDelete={onDelete}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Main FileTree component
export default function FileTree({
  items,
  activeFile,
  onSelect,
  onDelete,
  onCreateFile,
  onCreateFolder,
}) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const toggleFolder = (path) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="text-sm">
      {items.map((item) => (
        <TreeItem
          key={item.path || item.name}
          item={item}
          level={0}
          activeFile={activeFile}
          onSelect={onSelect}
          onDelete={onDelete}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
        />
      ))}
    </div>
  );
}
