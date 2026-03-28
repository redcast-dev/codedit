import { useState, useRef, useEffect } from "react";
import { aiRequest, listProviders, switchProvider, getCurrentProvider, isAIConfigured, generateProject } from "../lib/aiClient";

export default function AIChat({ code, language, files, onInsert, onApplyCode, onRevert, canRevert, onGenerateProject }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your AI coding assistant. I can help you generate code, refactor, explain concepts, fix bugs, generate entire projects, and more. What would you like to work on?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(getCurrentProvider());
  const [availableProviders, setAvailableProviders] = useState([]);
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check available providers
    const providers = listProviders();
    setAvailableProviders(providers);

    if (providers.length === 0) {
      setMessages([{
        role: "assistant",
        content: "⚠️ No AI providers configured. Please add API keys to .env file.\n\nSupported providers:\n• OpenAI (ChatGPT)\n• Anthropic (Claude)\n• Google (Gemini)\n• Groq\n\nSee .env.example for configuration.",
        timestamp: Date.now(),
        error: true
      }]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Check if asking for project generation
      const isProjectRequest = input.toLowerCase().includes('generate') &&
        (input.toLowerCase().includes('website') ||
          input.toLowerCase().includes('project') ||
          input.toLowerCase().includes('app') ||
          input.toLowerCase().includes('todo') ||
          input.toLowerCase().includes('landing page'));

      if (isProjectRequest && onGenerateProject) {
        // Generate entire project
        const result = await generateProject(input);

        const assistantMessage = {
          role: "assistant",
          content: `I've generated a complete project for you!\n\n${result.explanation}\n\nGenerated ${result.files.length} files. Click "Create Project" to add them to your workspace.`,
          timestamp: Date.now(),
          project: result,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Regular chat
        const context = {
          currentFile: code,
          language,
          files: Object.keys(files),
        };

        const res = await aiRequest("chat", {
          messages: [...messages, userMessage],
          context,
        });

        const assistantMessage = {
          role: "assistant",
          content: res.content,
          code: res.code,
          codeBlocks: res.codeBlocks,
          projectFiles: res.projectFiles, // Add project files if detected
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${e.message}\n\nPlease check:\n1. API key is set in .env\n2. API key is valid\n3. You have credits/quota available\n4. Internet connection is working`,
          timestamp: Date.now(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInsertCode(code) {
    const fileName = `ai-generated-${Date.now()}.${language}`;
    onInsert(code, fileName);
  }

  function handleProviderChange(providerId) {
    try {
      switchProvider(providerId);
      setCurrentProvider(providerId);
      setShowProviderMenu(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Switched to ${availableProviders.find(p => p.id === providerId)?.name}`,
          timestamp: Date.now(),
        },
      ]);
    } catch (e) {
      alert(e.message);
    }
  }

  function handleCreateProject(project) {
    if (onGenerateProject) {
      onGenerateProject(project);
    }
  }

  function handleAcceptAllFiles(projectFiles) {
    if (onGenerateProject && projectFiles) {
      // Convert projectFiles to the expected format
      const project = {
        files: projectFiles,
        explanation: `Automatically detected ${projectFiles.length} files from AI response`
      };
      onGenerateProject(project);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat header */}
      <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isAIConfigured() ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <h3 className="font-semibold text-gray-800">AI Assistant</h3>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="relative">
                <button
                  onClick={() => setShowProviderMenu(!showProviderMenu)}
                  className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                  disabled={availableProviders.length === 0}
                >
                  {availableProviders.find(p => p.id === currentProvider)?.name || 'No provider'}
                  <span className="text-xs">▼</span>
                </button>
                {showProviderMenu && availableProviders.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 bg-white border shadow-lg rounded z-10 min-w-[200px]">
                    {availableProviders.map(provider => (
                      <button
                        key={provider.id}
                        onClick={() => handleProviderChange(provider.id)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${provider.id === currentProvider ? 'bg-blue-50 text-blue-600' : ''
                          }`}
                      >
                        {provider.name}
                        <div className="text-xs text-gray-500">{provider.model}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {canRevert && (
              <button
                onClick={onRevert}
                className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-1"
                title="Revert last AI change"
              >
                ↩️ Revert
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 ${msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : msg.error
                    ? "bg-red-50 text-red-800 border border-red-200"
                    : "bg-gray-100 text-gray-800"
                }`}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

              {/* Project generation */}
              {msg.project && (
                <div className="mt-3">
                  <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs">
                    <div className="font-semibold mb-2">📁 Project Structure ({msg.project.files.length} files):</div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {msg.project.files.map((file, i) => (
                        <div key={i} className="text-green-400">• {file.path}</div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateProject(msg.project)}
                    className="w-full mt-2 text-xs px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-1"
                  >
                    🚀 Create Project in Workspace
                  </button>
                </div>
              )}

              {/* Auto-detected project files from code blocks */}
              {msg.projectFiles && !msg.project && (
                <div className="mt-3">
                  <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-gray-100 p-3 rounded text-xs border border-blue-400">
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <span>✨</span>
                      <span>Detected Project Structure ({msg.projectFiles.length} files)</span>
                    </div>
                    <div className="space-y-1 max-h-40 overflow-y-auto bg-black/20 p-2 rounded">
                      {msg.projectFiles.map((file, i) => (
                        <div key={i} className="text-green-300 font-mono text-xs flex items-start gap-2">
                          <span className="text-blue-400">📄</span>
                          <span>{file.path}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcceptAllFiles(msg.projectFiles)}
                    className="w-full mt-2 text-sm px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 font-semibold shadow-lg transition-all"
                  >
                    <span>✓</span>
                    <span>Accept All & Create Structure</span>
                  </button>
                </div>
              )}

              {/* Single code block */}
              {msg.code && !msg.project && !msg.projectFiles && (
                <div className="mt-2">
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-64">
                    <code>{msg.code}</code>
                  </pre>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => onApplyCode(msg.code)}
                      className="flex-1 text-xs px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-1"
                      title="Apply this code to current file"
                    >
                      ✓ Apply to Editor
                    </button>
                    <button
                      onClick={() => handleInsertCode(msg.code)}
                      className="flex-1 text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                      title="Insert as new file"
                    >
                      + New File
                    </button>
                  </div>
                </div>
              )}

              {/* Multiple code blocks */}
              {msg.codeBlocks && msg.codeBlocks.length > 1 && !msg.projectFiles && (
                <div className="mt-2 space-y-2">
                  {msg.codeBlocks.map((block, i) => (
                    <div key={i}>
                      <div className="text-xs text-gray-600 mb-1">{block.language}</div>
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto max-h-48">
                        <code>{block.content}</code>
                      </pre>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => onApplyCode(block.content)}
                          className="flex-1 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          ✓ Apply
                        </button>
                        <button
                          onClick={() => handleInsertCode(block.content)}
                          className="flex-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          + New File
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs opacity-70 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your code... (Shift+Enter for new line)"
            className="flex-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex gap-2 flex-wrap">
          <button
            onClick={() => setInput("Explain this code")}
            className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
          >
            💡 Explain
          </button>
          <button
            onClick={() => setInput("Refactor this code to be more efficient")}
            className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
          >
            🔧 Refactor
          </button>
          <button
            onClick={() => setInput("Find and fix bugs in this code")}
            className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
          >
            🐛 Fix Bugs
          </button>
          <button
            onClick={() => setInput("Add comments and documentation")}
            className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
          >
            📝 Document
          </button>
          <button
            onClick={() => setInput("Write unit tests for this code")}
            className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
          >
            ✅ Test
          </button>
          <button
            onClick={() => setInput("Generate a complete to-do list website with index.html, style.css, and app.js files")}
            className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
          >
            🚀 Generate Project
          </button>
          <button
            onClick={() => setInput("Create a landing page with HTML, CSS, and JavaScript in separate files")}
            className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
          >
            🌐 Landing Page
          </button>
        </div>
      </div>
    </div>
  );
}
