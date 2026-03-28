import { X, Moon, Sun, Type, Palette, Terminal as TerminalIcon, Sparkles } from 'lucide-react';

/**
 * Settings Modal Component
 */
export default function SettingsModal({ isOpen, onClose, settings, onSettingsChange, theme = 'dark' }) {
    if (!isOpen) return null;

    const isDark = theme === 'dark';

    const handleChange = (key, value) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className={`w-full max-w-2xl max-h-[80vh] overflow-auto rounded-lg shadow-2xl ${isDark ? 'bg-[#252526] text-white' : 'bg-white text-gray-900'
                }`}>
                {/* Header */}
                <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${isDark ? 'bg-[#2d2d30] border-[#3c3c3c]' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <h2 className="text-xl font-bold">Settings</h2>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded hover:bg-opacity-10 ${isDark ? 'hover:bg-white' : 'hover:bg-black'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Appearance */}
                    <section>
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <Palette className="w-5 h-5" />
                            Appearance
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium">Theme</label>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Choose your preferred color theme
                                    </p>
                                </div>
                                <select
                                    value={settings.theme || 'dark'}
                                    onChange={(e) => handleChange('theme', e.target.value)}
                                    className={`px-3 py-2 rounded border ${isDark
                                            ? 'bg-[#3c3c3c] border-[#555] text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                >
                                    <option value="dark">Dark</option>
                                    <option value="light">Light</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium">Font Size</label>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Editor font size
                                    </p>
                                </div>
                                <select
                                    value={settings.fontSize || '14'}
                                    onChange={(e) => handleChange('fontSize', e.target.value)}
                                    className={`px-3 py-2 rounded border ${isDark
                                            ? 'bg-[#3c3c3c] border-[#555] text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                >
                                    <option value="12">12px</option>
                                    <option value="14">14px</option>
                                    <option value="16">16px</option>
                                    <option value="18">18px</option>
                                    <option value="20">20px</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Editor */}
                    <section>
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <Type className="w-5 h-5" />
                            Editor
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium">Auto Save</label>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Automatically save files
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.autoSave || false}
                                    onChange={(e) => handleChange('autoSave', e.target.checked)}
                                    className="w-5 h-5"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium">Word Wrap</label>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Wrap long lines
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.wordWrap || false}
                                    onChange={(e) => handleChange('wordWrap', e.target.checked)}
                                    className="w-5 h-5"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium">Minimap</label>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Show code minimap
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.minimap !== false}
                                    onChange={(e) => handleChange('minimap', e.target.checked)}
                                    className="w-5 h-5"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Terminal */}
                    <section>
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <TerminalIcon className="w-5 h-5" />
                            Terminal
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium">Default Shell</label>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Choose default terminal shell
                                    </p>
                                </div>
                                <select
                                    value={settings.defaultShell || 'powershell'}
                                    onChange={(e) => handleChange('defaultShell', e.target.value)}
                                    className={`px-3 py-2 rounded border ${isDark
                                            ? 'bg-[#3c3c3c] border-[#555] text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                >
                                    <option value="powershell">PowerShell</option>
                                    <option value="cmd">Command Prompt</option>
                                    <option value="bash">Bash</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* AI Assistant */}
                    <section>
                        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <Sparkles className="w-5 h-5" />
                            AI Assistant
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="font-medium">Auto-suggestions</label>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Enable AI code suggestions
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.aiSuggestions !== false}
                                    onChange={(e) => handleChange('aiSuggestions', e.target.checked)}
                                    className="w-5 h-5"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className={`sticky bottom-0 flex justify-end gap-2 p-4 border-t ${isDark ? 'bg-[#2d2d30] border-[#3c3c3c]' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded font-medium ${isDark
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
