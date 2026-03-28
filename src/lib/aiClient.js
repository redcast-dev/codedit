import { createAIProvider, getAPIKey, getAvailableProviders } from './aiProviders';

// Current AI provider instance
let currentProvider = null;
let currentProviderName = null;

// Initialize AI provider
export function initializeAI(providerName = null) {
  // Always default to Gemini (Google) as the preferred provider
  const defaultProvider = 'google';
  const provider = providerName || defaultProvider;

  const apiKey = getAPIKey(provider);
  if (!apiKey) {
    throw new Error(`No API key found for provider: ${provider}. Please add it to .env`);
  }

  const availableProviders = getAvailableProviders();
  const providerConfig = availableProviders.find(p => p.id === provider);

  if (!providerConfig) {
    throw new Error(`Provider ${provider} not configured`);
  }

  currentProvider = createAIProvider(provider, apiKey, providerConfig.model);
  currentProviderName = provider;

  return currentProvider;
}

// Get current provider or initialize default
function getProvider() {
  if (!currentProvider) {
    initializeAI();
  }
  return currentProvider;
}

// Switch AI provider
export function switchProvider(providerName) {
  initializeAI(providerName);
}

// Get current provider name
export function getCurrentProvider() {
  // Always default to Gemini (Google) as the preferred provider
  return currentProviderName || 'google';
}

// Main AI request function
export async function aiRequest(endpoint, payload) {
  const provider = getProvider();

  if (endpoint === "chat") {
    // Build messages with context
    const messages = [
      {
        role: 'system',
        content: `You are an expert coding assistant. You help developers write, refactor, debug, and understand code. 

Current context:
- Language: ${payload.context?.language || 'unknown'}
- Files in project: ${payload.context?.files?.join(', ') || 'none'}

When generating code:
1. Provide clean, production-ready code
2. Include comments for complex logic
3. Follow best practices and modern patterns
4. Consider edge cases and error handling

When the user asks you to generate a website, app, or project:
1. Generate ALL necessary files (HTML, CSS, JS, config files, etc.)
2. Create a proper folder structure
3. Include package.json if needed
4. Make it production-ready

If you generate code, wrap it in triple backticks with the language specified.`
      },
      ...payload.messages
    ];

    try {
      const result = await provider.chat(messages);

      // Extract code from response
      const codeBlocks = extractCodeBlocks(result.content);

      // Check if this is a project structure response
      const isProjectStructure = detectProjectStructure(result.content, codeBlocks);
      let projectFiles = null;

      if (isProjectStructure) {
        projectFiles = parseProjectFromResponse(result.content, codeBlocks);
        // Only set projectFiles if we actually found some files
        if (projectFiles.length === 0) {
          projectFiles = null;
        }
      }

      return {
        content: result.content,
        code: codeBlocks.length > 0 ? codeBlocks[0].content : null,
        codeBlocks: codeBlocks,
        projectFiles: projectFiles, // Array of {path, content, language}
        usage: result.usage
      };
    } catch (error) {
      console.error('AI request error:', error);
      throw error;
    }
  } else if (endpoint === "generateProject") {
    try {
      const result = await provider.generateProject(payload.description, payload.options);
      return result;
    } catch (error) {
      console.error('Project generation error:', error);
      throw error;
    }
  } else if (endpoint === "generate") {
    const messages = [
      {
        role: 'system',
        content: 'You are a code generation expert. Generate clean, production-ready code based on the user request.'
      },
      {
        role: 'user',
        content: `Generate ${payload.language} code for: ${payload.prompt}`
      }
    ];

    const result = await provider.chat(messages);
    const codeBlocks = extractCodeBlocks(result.content);

    return {
      code: codeBlocks.length > 0 ? codeBlocks[0].content : result.content,
      explanation: result.content
    };
  } else {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }
}

// Extract code blocks from markdown
export function extractCodeBlocks(text) {
  const codeBlockRegex = /```([\w]*)?\n([\s\S]*?)```/g;
  const blocks = [];
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      content: match[2].trim()
    });
  }

  return blocks;
}

// Detect if response contains a project structure
export function detectProjectStructure(text, codeBlocks) {
  // Check if text mentions file paths or structure
  const hasStructureIndicators =
    text.includes('├──') ||
    text.includes('└──') ||
    text.includes('│') ||
    text.includes('todo-app/') ||
    text.includes('index.html') ||
    text.includes('style.css') ||
    text.includes('app.js') ||
    /\w+\/[\w.]+/.test(text) || // matches patterns like "folder/file.ext"
    /^\s*[├└│]\s*[\w.-]+$/m.test(text); // matches tree structure lines

  // Check if the response contains multiple file references
  const fileExtensions = /\.(html|css|js|jsx|ts|tsx|json|md|py|java|cpp|c|go|rs|rb|php|sh|sql|xml|yaml|yml|txt)/gi;
  const fileMatches = text.match(fileExtensions) || [];

  // Check for common project structure patterns
  const hasProjectKeywords =
    text.toLowerCase().includes('structure') ||
    text.toLowerCase().includes('files') ||
    text.toLowerCase().includes('folder') ||
    text.toLowerCase().includes('directory');

  // If we have multiple code blocks, likely a project
  if (codeBlocks.length > 1) {
    return true;
  }

  // If we have multiple file references, likely a project
  if (fileMatches.length > 1) {
    return true;
  }

  // If we have structure indicators and project keywords
  if (hasStructureIndicators && hasProjectKeywords) {
    return true;
  }

  return hasStructureIndicators;
}

// Parse project structure from AI response
export function parseProjectFromResponse(text, codeBlocks) {
  const files = [];

  // Extract file paths from tree structure
  const lines = text.split('\n');
  const detectedFiles = [];

  // Look for tree structure patterns and file paths
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Match tree structure patterns like "├── index.html" or "└── app.js"
    const treeMatch = trimmedLine.match(/[├└│]\s*(?:──\s*)?([a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*)/);
    if (treeMatch) {
      const fileName = treeMatch[1];
      if (fileName.includes('.')) { // It's a file, not a folder
        detectedFiles.push(fileName);
      }
    }

    // Match lines that look like file paths with folder structure
    const folderFileMatch = trimmedLine.match(/^([a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)$/);
    if (folderFileMatch && folderFileMatch[1].includes('.') && !detectedFiles.includes(folderFileMatch[1])) {
      detectedFiles.push(folderFileMatch[1]);
    }

    // Also match lines that just contain file names with extensions
    const simpleFileMatch = trimmedLine.match(/^([a-zA-Z0-9_-]+\.[a-zA-Z0-9]+)$/);
    if (simpleFileMatch && !detectedFiles.includes(simpleFileMatch[1])) {
      detectedFiles.push(simpleFileMatch[1]);
    }

    // Match any file path pattern in the line (but avoid duplicates)
    const pathMatches = trimmedLine.match(/([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)*\.[a-zA-Z0-9]+)/g);
    if (pathMatches) {
      pathMatches.forEach(path => {
        // Avoid adding duplicates and prefer the full path over just filename
        const fileName = path.split('/').pop();
        const existingIndex = detectedFiles.findIndex(f => f.endsWith(fileName));
        if (existingIndex >= 0) {
          // Replace with the more complete path
          if (path.includes('/') && !detectedFiles[existingIndex].includes('/')) {
            detectedFiles[existingIndex] = path;
          }
        } else if (!detectedFiles.includes(path)) {
          detectedFiles.push(path);
        }
      });
    }
  }

  // If we have code blocks, try to match them to detected files
  if (codeBlocks.length > 0) {
    codeBlocks.forEach((block, index) => {
      let filePath = null;

      // Try to find a matching file path for this code block
      if (detectedFiles.length > index) {
        filePath = detectedFiles[index];
      } else {
        // Look for file path mentioned before this code block
        const blockStartIndex = text.indexOf('```' + block.language);
        if (blockStartIndex > 0) {
          const textBefore = text.substring(Math.max(0, blockStartIndex - 200), blockStartIndex);
          const pathMatch = textBefore.match(/([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)*\.[a-zA-Z0-9]+)/g);
          if (pathMatch && pathMatch.length > 0) {
            filePath = pathMatch[pathMatch.length - 1];
          }
        }
      }

      // If no path found, generate one based on language
      if (!filePath) {
        const ext = getExtensionFromLanguage(block.language);
        filePath = `file${index + 1}.${ext}`;
      }

      files.push({
        path: filePath,
        content: block.content,
        language: block.language
      });
    });
  } else if (detectedFiles.length > 0) {
    // No code blocks, but we have detected files - create empty files
    detectedFiles.forEach(filePath => {
      const ext = filePath.split('.').pop();
      const language = getLanguageFromExtension(ext);

      files.push({
        path: filePath,
        content: getTemplateContent(language, filePath),
        language: language
      });
    });
  }

  return files;
}

// Get template content for a file based on its type
function getTemplateContent(language, filePath) {
  const fileName = filePath.split('/').pop();

  switch (language) {
    case 'html':
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName.replace('.html', '')}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Hello World</h1>
    <script src="app.js"></script>
</body>
</html>`;
    case 'css':
      return `/* ${fileName} */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
    text-align: center;
}`;
    case 'javascript':
      return `// ${fileName}
console.log('Hello from ${fileName}');

// Add your JavaScript code here`;
    default:
      return `// ${fileName}
// Generated file`;
  }
}

// Get language from file extension
function getLanguageFromExtension(ext) {
  const extMap = {
    html: 'html',
    css: 'css',
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
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
    txt: 'plaintext'
  };
  return extMap[ext.toLowerCase()] || 'plaintext';
}

// Get file extension from language
function getExtensionFromLanguage(language) {
  const extMap = {
    javascript: 'js',
    js: 'js',
    jsx: 'jsx',
    typescript: 'ts',
    tsx: 'tsx',
    html: 'html',
    css: 'css',
    json: 'json',
    markdown: 'md',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rust: 'rs',
    ruby: 'rb',
    php: 'php',
    shell: 'sh',
    bash: 'sh',
    sql: 'sql',
    xml: 'xml',
    yaml: 'yaml',
    text: 'txt'
  };
  return extMap[language.toLowerCase()] || 'txt';
}

// Check if AI is configured
export function isAIConfigured() {
  const providers = getAvailableProviders();
  return providers.length > 0;
}

// Get list of available providers
export function listProviders() {
  return getAvailableProviders();
}

// Generate entire project structure
export async function generateProject(description, options = {}) {
  return await aiRequest('generateProject', { description, options });
}

// Generate single file
export async function generateCode(prompt, language, context = {}) {
  return await aiRequest('generate', { prompt, language, context });
}

// Chat with AI
export async function chat(messages, context = {}) {
  return await aiRequest('chat', { messages, context });
}
