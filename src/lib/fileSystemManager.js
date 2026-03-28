// File System Access API Manager for real local file operations
// This provides read/write access to local folders and files

class FileSystemManager {
  constructor() {
    this.directoryHandle = null;
    this.fileHandles = new Map(); // Map of file paths to file handles
    this.isSupported = 'showDirectoryPicker' in window;
  }

  // Check if File System Access API is supported
  isFileSystemAccessSupported() {
    return this.isSupported;
  }

  // Open a folder from local storage
  async openFolder() {
    try {
      this.directoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
      });
      return this.directoryHandle;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('User cancelled folder selection');
        return null;
      }
      throw err;
    }
  }

  // Read all files from the opened folder (recursive)
  async readFolder(dirHandle = this.directoryHandle, basePath = '') {
    if (!dirHandle) {
      throw new Error('No folder opened. Call openFolder() first.');
    }

    const files = {};
    const folders = [];
    const tree = [];

    for await (const entry of dirHandle.values()) {
      const currentPath = basePath ? `${basePath}/${entry.name}` : entry.name;
      
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        const content = await file.text();
        const ext = this.getFileExtension(entry.name);
        const language = this.getLanguageFromExtension(ext);

        const fileObj = {
          id: `file_${currentPath}`,
          name: entry.name,
          path: currentPath,
          language,
          content,
          handle: entry,
          type: 'file',
        };

        files[currentPath] = fileObj;
        tree.push(fileObj);
        this.fileHandles.set(currentPath, entry);
      } else if (entry.kind === 'directory') {
        // Read subfolder recursively
        const subResult = await this.readFolder(entry, currentPath);
        
        const folderObj = {
          id: `folder_${currentPath}`,
          name: entry.name,
          path: currentPath,
          type: 'folder',
          handle: entry,
          children: subResult.tree,
        };

        folders.push(folderObj);
        tree.push(folderObj);
        
        // Merge subfiles into main files object
        Object.assign(files, subResult.files);
      }
    }

    return { files, folders, tree };
  }

  // Create a new file in the opened folder or nested path
  async createFile(fileName, content = '', parentPath = '') {
    if (!this.directoryHandle) {
      throw new Error('No folder opened. Call openFolder() first.');
    }

    try {
      let targetDir = this.directoryHandle;
      
      // Navigate to parent folder if path provided
      if (parentPath) {
        const pathParts = parentPath.split('/');
        for (const part of pathParts) {
          try {
            targetDir = await targetDir.getDirectoryHandle(part);
          } catch (err) {
            // If folder doesn't exist, create it
            if (err.name === 'NotFoundError') {
              targetDir = await targetDir.getDirectoryHandle(part, { create: true });
            } else {
              throw err;
            }
          }
        }
      }

      const fileHandle = await targetDir.getFileHandle(fileName, {
        create: true,
      });

      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
      this.fileHandles.set(fullPath, fileHandle);

      const ext = this.getFileExtension(fileName);
      const language = this.getLanguageFromExtension(ext);

      return {
        id: `file_${fullPath}`,
        name: fileName,
        path: fullPath,
        language,
        content,
        handle: fileHandle,
        type: 'file',
      };
    } catch (err) {
      // Handle stale handle errors
      if (err.message.includes('state cached in an interface object') || 
          err.name === 'InvalidStateError' ||
          err.name === 'NotAllowedError') {
        console.warn('Directory handle became stale, please reopen the folder');
        throw new Error('Directory access expired. Please reopen the folder and try again.');
      }
      console.error('Error creating file:', err);
      throw err;
    }
  }

  // Write content to an existing file
  async writeFile(fileName, content) {
    let fileHandle = this.fileHandles.get(fileName);

    if (!fileHandle && this.directoryHandle) {
      // Try to get the file handle if not in cache
      try {
        fileHandle = await this.directoryHandle.getFileHandle(fileName);
        this.fileHandles.set(fileName, fileHandle);
      } catch (err) {
        throw new Error(`File ${fileName} not found`);
      }
    }

    if (!fileHandle) {
      throw new Error(`No handle for file ${fileName}`);
    }

    try {
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      return true;
    } catch (err) {
      console.error('Error writing file:', err);
      throw err;
    }
  }

  // Delete a file from the opened folder
  async deleteFile(fileName) {
    if (!this.directoryHandle) {
      throw new Error('No folder opened.');
    }

    try {
      // First check if the file exists
      await this.directoryHandle.getFileHandle(fileName);
      // If we get here, the file exists, so we can delete it
      await this.directoryHandle.removeEntry(fileName);
      this.fileHandles.delete(fileName);
      return true;
    } catch (err) {
      if (err.name === 'NotFoundError') {
        console.warn(`File '${fileName}' does not exist, skipping deletion.`);
        this.fileHandles.delete(fileName); // Clean up from cache anyway
        return false; // File doesn't exist, but that's not really an error
      }
      console.error('Error deleting file:', err);
      throw err;
    }
  }

  // Create a new folder (supports nested paths)
  async createFolder(folderName, parentPath = '') {
    if (!this.directoryHandle) {
      throw new Error('No folder opened. Call openFolder() first.');
    }

    try {
      let targetDir = this.directoryHandle;
      
      // Navigate to parent folder if path provided
      if (parentPath) {
        const pathParts = parentPath.split('/');
        for (const part of pathParts) {
          try {
            targetDir = await targetDir.getDirectoryHandle(part);
          } catch (err) {
            // If folder doesn't exist, create it
            if (err.name === 'NotFoundError') {
              targetDir = await targetDir.getDirectoryHandle(part, { create: true });
            } else {
              throw err;
            }
          }
        }
      }

      const folderHandle = await targetDir.getDirectoryHandle(folderName, {
        create: true,
      });

      const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;

      return {
        id: `folder_${fullPath}`,
        name: folderName,
        path: fullPath,
        type: 'folder',
        handle: folderHandle,
        children: [],
      };
    } catch (err) {
      // Handle stale handle errors
      if (err.message.includes('state cached in an interface object') || 
          err.name === 'InvalidStateError' ||
          err.name === 'NotAllowedError') {
        console.warn('Directory handle became stale, please reopen the folder');
        throw new Error('Directory access expired. Please reopen the folder and try again.');
      }
      console.error('Error creating folder:', err);
      throw err;
    }
  }

  // Delete a folder
  async deleteFolder(folderName) {
    if (!this.directoryHandle) {
      throw new Error('No folder opened.');
    }

    try {
      // First check if the folder exists
      await this.directoryHandle.getDirectoryHandle(folderName);
      // If we get here, the folder exists, so we can delete it
      await this.directoryHandle.removeEntry(folderName, { recursive: true });
      return true;
    } catch (err) {
      if (err.name === 'NotFoundError') {
        console.warn(`Folder '${folderName}' does not exist, skipping deletion.`);
        return false; // Folder doesn't exist, but that's not really an error
      }
      console.error('Error deleting folder:', err);
      throw err;
    }
  }

  // Read a file from a subfolder
  async readFileFromFolder(folderHandle, fileName) {
    try {
      const fileHandle = await folderHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const content = await file.text();
      
      const ext = this.getFileExtension(fileName);
      const language = this.getLanguageFromExtension(ext);

      return {
        id: `file_${fileName}`,
        name: fileName,
        language,
        content,
        handle: fileHandle,
        type: 'file',
      };
    } catch (err) {
      console.error('Error reading file from folder:', err);
      throw err;
    }
  }

  // Get file extension
  getFileExtension(fileName) {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  }

  // Get language from extension
  getLanguageFromExtension(ext) {
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      go: 'go',
      rs: 'rust',
      rb: 'ruby',
      php: 'php',
      sh: 'shell',
      sql: 'sql',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      txt: 'plaintext',
    };
    return languageMap[ext.toLowerCase()] || 'plaintext';
  }

  // Get the current directory handle
  getDirectoryHandle() {
    return this.directoryHandle;
  }

  // Get folder name
  getFolderName() {
    return this.directoryHandle ? this.directoryHandle.name : null;
  }

  // Check if directory handle is still valid
  async isHandleValid() {
    if (!this.directoryHandle) return false;
    
    try {
      // Try to perform a simple operation to check if handle is still valid
      await this.directoryHandle.queryPermission({ mode: 'readwrite' });
      return true;
    } catch (err) {
      console.warn('Directory handle is no longer valid:', err);
      return false;
    }
  }

  // Clear stale handles
  clearHandles() {
    this.directoryHandle = null;
    this.fileHandles.clear();
  }
}

// Export singleton instance
export const fileSystemManager = new FileSystemManager();

// Export helper functions
export const uid = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

// Demo virtual file system (fallback for browsers without File System Access API)
export const defaultFiles = {
  'index.html': {
    id: uid('f'),
    name: 'index.html',
    language: 'html',
    type: 'file',
    content: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>CODEDIT Demo</title>
  </head>
  <body>
    <div id="app">Hello from CODEDIT!</div>
    <script src="app.js"></script>
  </body>
</html>`,
  },
  'app.js': {
    id: uid('f'),
    name: 'app.js',
    language: 'javascript',
    type: 'file',
    content: `const root = document.getElementById('app');
root.innerHTML += '<p>Running from CODEDIT sandbox</p>';
console.log('CODEDIT is running!');`,
  },
};

export function getLanguageFromExtension(ext) {
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rs: 'rust',
    rb: 'ruby',
    php: 'php',
    sh: 'shell',
    sql: 'sql',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    txt: 'plaintext',
  };
  return languageMap[ext.toLowerCase()] || 'plaintext';
}
