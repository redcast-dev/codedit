import { Folder, FileText, Sparkles, Code2, Zap } from 'lucide-react';

/**
 * Welcome Screen - Shown when no folder is opened
 */
export default function WelcomeScreen({ onOpenFolder, onNewFile, theme = 'dark' }) {
    const isDark = theme === 'dark';

    return (
        <div className={`h-full flex items-center justify-center ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
            <div className="max-w-2xl mx-auto px-8 text-center">
                {/* Logo */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-6">
                        <Code2 className="w-12 h-12 text-white" />
                    </div>
                    <h1 className={`text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Welcome to CODEDIT
                    </h1>
                    <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        AI-Powered Professional Code Editor
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={onOpenFolder}
                        className={`group p-6 rounded-lg border-2 transition-all hover:scale-105 ${isDark
                                ? 'bg-[#252526] border-[#3c3c3c] hover:border-blue-500'
                                : 'bg-gray-50 border-gray-200 hover:border-blue-500'
                            }`}
                    >
                        <Folder className={`w-10 h-10 mb-3 mx-auto ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Open Folder
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Open an existing project folder
                        </p>
                    </button>

                    <button
                        onClick={onNewFile}
                        className={`group p-6 rounded-lg border-2 transition-all hover:scale-105 ${isDark
                                ? 'bg-[#252526] border-[#3c3c3c] hover:border-indigo-500'
                                : 'bg-gray-50 border-gray-200 hover:border-indigo-500'
                            }`}
                    >
                        <FileText className={`w-10 h-10 mb-3 mx-auto ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            New File
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Start with a blank file
                        </p>
                    </button>
                </div>

                {/* Features */}
                <div className={`mt-12 pt-8 border-t ${isDark ? 'border-[#3c3c3c]' : 'border-gray-200'}`}>
                    <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <Sparkles className={`w-8 h-8 mb-2 mx-auto ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                            <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                AI Assistant
                            </h4>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Intelligent code generation and refactoring
                            </p>
                        </div>
                        <div className="text-center">
                            <Code2 className={`w-8 h-8 mb-2 mx-auto ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                            <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Monaco Editor
                            </h4>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                VS Code-powered editing experience
                            </p>
                        </div>
                        <div className="text-center">
                            <Zap className={`w-8 h-8 mb-2 mx-auto ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                            <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Integrated Terminal
                            </h4>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Run commands directly in the editor
                            </p>
                        </div>
                    </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className={`mt-8 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    <p className="mb-2">Quick Tips:</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <span><kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl+K</kbd> Command Palette</span>
                        <span><kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl+`</kbd> Toggle Terminal</span>
                        <span><kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl+S</kbd> Save File</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
