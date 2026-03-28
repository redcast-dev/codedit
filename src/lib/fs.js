// Simple utility to generate unique ids
export const uid = (prefix = "id") => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

// Demo virtual file system (in-memory)
export const defaultFiles = {
  "index.html": {
    id: uid("f"),
    name: "index.html",
    language: "html",
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
  "app.js": {
    id: uid("f"),
    name: "app.js",
    language: "javascript",
    content: `const root = document.getElementById('app');
root.innerHTML += '<p>Running from CODEDIT sandbox</p>';
console.log('CODEDIT is running!');`,
  },
};

// Helper functions for file system operations
export function createFile(name, language = "javascript", content = "") {
  return {
    id: uid("f"),
    name,
    language,
    content,
  };
}

export function updateFile(file, updates) {
  return {
    ...file,
    ...updates,
  };
}

export function deleteFile(files, fileName) {
  const newFiles = { ...files };
  delete newFiles[fileName];
  return newFiles;
}

export function addFile(files, file) {
  return {
    ...files,
    [file.name]: file,
  };
}

export function getFileExtension(fileName) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function getLanguageFromExtension(ext) {
  const languageMap = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    go: "go",
    rs: "rust",
    rb: "ruby",
    php: "php",
    sh: "shell",
    sql: "sql",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
  };
  return languageMap[ext.toLowerCase()] || "plaintext";
}

// Export/Import helpers (for future use)
export function exportFiles(files) {
  return JSON.stringify(files, null, 2);
}

export function importFiles(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to import files:", e);
    return null;
  }
}
