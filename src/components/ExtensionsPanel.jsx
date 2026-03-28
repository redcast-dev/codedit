import { Package, Download, Star, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Extensions Panel - Manage extensions
 */
export default function ExtensionsPanel({ theme = 'dark' }) {
    const bgColor = theme === 'dark' ? 'bg-[#252526]' : 'bg-[#f3f3f3]';
    const textColor = theme === 'dark' ? 'text-[#cccccc]' : 'text-[#333333]';

    const extensions = [
        {
            id: 'prettier',
            name: 'Prettier',
            description: 'Code formatter',
            author: 'Prettier',
            downloads: '50M+',
            rating: 4.9,
            installed: true
        },
        {
            id: 'eslint',
            name: 'ESLint',
            description: 'JavaScript linter',
            author: 'Microsoft',
            downloads: '30M+',
            rating: 4.8,
            installed: true
        },
        {
            id: 'live-server',
            name: 'Live Server',
            description: 'Launch development server',
            author: 'Ritwick Dey',
            downloads: '20M+',
            rating: 4.7,
            installed: false
        }
    ];

    return (
        <div className={cn("h-full flex flex-col", bgColor, textColor)}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#3c3c3c]">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Extensions
                </h3>

                <input
                    type="text"
                    placeholder="Search extensions..."
                    className={cn(
                        "w-full px-3 py-2 rounded border text-sm",
                        theme === 'dark'
                            ? 'bg-[#3c3c3c] border-[#555]'
                            : 'bg-white border-gray-300'
                    )}
                />
            </div>

            {/* Extensions List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {extensions.map((ext) => (
                    <div
                        key={ext.id}
                        className={cn(
                            "p-4 rounded-lg border",
                            theme === 'dark'
                                ? 'bg-[#2a2a2a] border-[#3c3c3c]'
                                : 'bg-white border-gray-200'
                        )}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-500/20 rounded">
                                    <Package className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold">{ext.name}</h4>
                                    <p className="text-xs opacity-60">{ext.description}</p>
                                    <p className="text-xs opacity-40 mt-1">{ext.author}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3 text-xs opacity-60">
                                <div className="flex items-center gap-1">
                                    <Download className="w-3 h-3" />
                                    {ext.downloads}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400" />
                                    {ext.rating}
                                </div>
                            </div>

                            {ext.installed ? (
                                <button className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                    Installed
                                </button>
                            ) : (
                                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                                    Install
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Info */}
            <div className="p-4 border-t border-[#3c3c3c]">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded">
                    <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400 mt-0.5" />
                        <div className="text-xs">
                            <p className="font-medium mb-1">Extension Marketplace</p>
                            <p className="opacity-80">
                                Full extension support coming soon. Install themes, languages, and tools.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
