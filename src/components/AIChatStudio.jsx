import { useState, useRef, useEffect } from 'react';
import {
    Send,
    Bot,
    User,
    Code,
    Check,
    X,
    Copy,
    Sparkles,
    Loader2,
    Trash2,
    RotateCcw,
    FileCode,
    FolderPlus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { extractCodeBlocks, detectProjectStructure, parseProjectFromResponse } from '../lib/aiClient';

/**
 * Enhanced AI Chat Studio with Cursor/Windsurf-style Accept/Reject
 */
export default function AIChatStudio({
    theme = 'dark',
    code = '',
    language = 'javascript',
    files = {},
    onApplyCode,
    onCreateFile,
    onRevert
}) {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: '👋 Hi! I\'m your AI coding assistant. I can help you:\n\n• Write and refactor code\n• Fix bugs and errors\n• Generate tests\n• Explain complex code\n• Create entire projects\n\nWhat would you like to build today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pendingCode, setPendingCode] = useState(null); // Code waiting for accept/reject
    const [pendingFiles, setPendingFiles] = useState(null); // Multiple files waiting for creation
    const [showDiff, setShowDiff] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const bgColor = theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white';
    const borderColor = theme === 'dark' ? 'border-[#252526]' : 'border-[#e5e5e5]';
    const textColor = theme === 'dark' ? 'text-[#cccccc]' : 'text-[#333333]';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    context: {
                        currentCode: code,
                        language,
                        files: Object.keys(files)
                    }
                })
            });

            const data = await response.json();

            // Check for project structure
            const codeBlocks = extractCodeBlocks(data.content || '');
            const isProject = detectProjectStructure(data.content || '', codeBlocks);
            let projectFiles = null;

            if (isProject) {
                projectFiles = parseProjectFromResponse(data.content || '', codeBlocks);
            }

            const assistantMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: data.content || data.message || 'I apologize, but I encountered an error.',
                code: data.code,
                projectFiles: projectFiles && projectFiles.length > 0 ? projectFiles : null,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

            // If AI generated a project structure with multiple files
            if (assistantMessage.projectFiles) {
                setPendingFiles({
                    files: assistantMessage.projectFiles,
                    messageId: assistantMessage.id
                });
                setPendingCode(null); // Clear pending single code
            }
            // If AI generated single code block
            else if (data.code) {
                setPendingCode({
                    code: data.code,
                    messageId: assistantMessage.id,
                    originalCode: code
                });
                setPendingFiles(null);
            }
        } catch (error) {
            console.error('AI Chat error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: '⚠️ Sorry, I\'m having trouble connecting. Make sure the backend server is running on port 3001.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = async () => {
        if (pendingFiles && onCreateFile) {
            // Create all files
            let createdCount = 0;
            for (const file of pendingFiles.files) {
                try {
                    await onCreateFile(file.path, file.content);
                    createdCount++;
                } catch (err) {
                    console.error(`Failed to create file ${file.path}:`, err);
                }
            }

            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'assistant',
                content: `✅ Successfully created ${createdCount} files.`,
                timestamp: new Date()
            }]);

            setPendingFiles(null);
        } else if (pendingCode && onApplyCode) {
            onApplyCode(pendingCode.code);
            setPendingCode(null);
            setShowDiff(false);
        }
    };

    const handleReject = () => {
        setPendingCode(null);
        setPendingFiles(null);
        setShowDiff(false);
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
    };

    const handleClearChat = () => {
        setMessages([messages[0]]);
        setPendingCode(null);
        setPendingFiles(null);
    };

    return (
        <div className={cn(
            "flex flex-col h-full",
            bgColor,
            textColor
        )}>
            {/* Header */}
            <div className={cn(
                "flex items-center justify-between px-4 py-3 border-b",
                borderColor
            )}>
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold">AI Assistant</div>
                        <div className="text-xs opacity-60">Context-aware coding help</div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {onRevert && (
                        <button
                            onClick={onRevert}
                            className={cn(
                                "p-1.5 rounded transition-colors",
                                theme === 'dark' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-[#e8e8e8]'
                            )}
                            title="Revert last change"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={handleClearChat}
                        className={cn(
                            "p-1.5 rounded transition-colors",
                            theme === 'dark' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-[#e8e8e8]'
                        )}
                        title="Clear chat"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Pending Files Banner */}
            {pendingFiles && (
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 border-b border-purple-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                            <FolderPlus className="w-4 h-4" />
                            <span className="text-sm font-medium">AI generated {pendingFiles.files.length} files</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleReject}
                                className="px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 text-white text-sm flex items-center gap-1.5 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                Reject
                            </button>
                            <button
                                onClick={handleAccept}
                                className="px-3 py-1.5 rounded bg-white hover:bg-gray-100 text-purple-600 text-sm font-medium flex items-center gap-1.5 transition-colors"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Create Files
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Code Banner (Cursor/Windsurf style) */}
            {pendingCode && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 border-b border-blue-500">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                            <FileCode className="w-4 h-4" />
                            <span className="text-sm font-medium">AI generated code ready</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleReject}
                                className="px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 text-white text-sm flex items-center gap-1.5 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                Reject
                            </button>
                            <button
                                onClick={handleAccept}
                                className="px-3 py-1.5 rounded bg-white hover:bg-gray-100 text-blue-600 text-sm font-medium flex items-center gap-1.5 transition-colors"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            "flex gap-3",
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {message.role === 'assistant' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                        )}

                        <div className={cn(
                            "flex-1 max-w-[85%]",
                            message.role === 'user' && 'flex justify-end'
                        )}>
                            <div className={cn(
                                "rounded-lg p-3",
                                message.role === 'user'
                                    ? 'bg-[#007acc] text-white'
                                    : theme === 'dark' ? 'bg-[#2d2d2d]' : 'bg-[#f3f3f3]'
                            )}>
                                <div className="text-sm whitespace-pre-wrap">{message.content}</div>

                                {/* Code block with Accept/Reject */}
                                {message.code && (
                                    <div className="mt-3">
                                        <div className={cn(
                                            "rounded-lg overflow-hidden border",
                                            pendingCode?.messageId === message.id
                                                ? 'border-blue-500 ring-2 ring-blue-500/50'
                                                : theme === 'dark' ? 'border-[#3c3c3c] bg-[#1e1e1e]' : 'border-[#e5e5e5] bg-white'
                                        )}>
                                            <div className={cn(
                                                "flex items-center justify-between px-3 py-2 border-b text-xs",
                                                theme === 'dark' ? 'border-[#3c3c3c] bg-[#252526]' : 'border-[#e5e5e5] bg-[#f3f3f3]'
                                            )}>
                                                <div className="flex items-center gap-1.5">
                                                    <Code className="w-3.5 h-3.5" />
                                                    <span className="opacity-60">{language}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleCopyCode(message.code)}
                                                        className={cn(
                                                            "p-1 rounded transition-colors",
                                                            theme === 'dark' ? 'hover:bg-[#3c3c3c]' : 'hover:bg-[#e8e8e8]'
                                                        )}
                                                        title="Copy code"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <pre className="p-3 text-xs overflow-x-auto">
                                                <code>{message.code}</code>
                                            </pre>

                                            {/* Accept/Reject buttons for this specific code */}
                                            {pendingCode?.messageId === message.id && (
                                                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border-t border-blue-500/20">
                                                    <button
                                                        onClick={handleReject}
                                                        className="flex-1 px-3 py-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm flex items-center justify-center gap-1.5 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={handleAccept}
                                                        className="flex-1 px-3 py-2 rounded bg-green-500 hover:bg-green-600 text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Accept & Apply
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {message.role === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#007acc] flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className={cn(
                            "rounded-lg p-3",
                            theme === 'dark' ? 'bg-[#2d2d2d]' : 'bg-[#f3f3f3]'
                        )}>
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={cn(
                "p-4 border-t",
                borderColor
            )}>
                <div className={cn(
                    "flex gap-2 p-2 rounded-lg border",
                    theme === 'dark' ? 'border-[#3c3c3c] bg-[#2d2d2d]' : 'border-[#e5e5e5] bg-white'
                )}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ask AI anything... (Enter to send)"
                        className={cn(
                            "flex-1 bg-transparent outline-none text-sm",
                            textColor
                        )}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={cn(
                            "p-2 rounded transition-colors",
                            input.trim() && !isLoading
                                ? 'bg-[#007acc] text-white hover:bg-[#005a9e]'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        )}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>

                <div className="mt-2 text-xs opacity-60 text-center">
                    AI can see your current file and project structure
                </div>
            </div>
        </div>
    );
}
