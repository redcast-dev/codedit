import { GitBranch, GitCommit, GitPullRequest, RefreshCw, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Source Control Panel - Git integration
 */
export default function SourceControlPanel({ theme = 'dark' }) {
    const bgColor = theme === 'dark' ? 'bg-[#252526]' : 'bg-[#f3f3f3]';
    const textColor = theme === 'dark' ? 'text-[#cccccc]' : 'text-[#333333]';

    return (
        <div className={cn("h-full flex flex-col", bgColor, textColor)}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#3c3c3c]">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Source Control
                </h3>

                <div className="flex items-center gap-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center justify-center gap-2">
                        <GitCommit className="w-4 h-4" />
                        Commit
                    </button>
                    <button className="px-3 py-2 bg-[#3c3c3c] hover:bg-[#505050] text-white text-sm rounded transition-colors">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Current Branch */}
                <div className="mb-6">
                    <div className="text-xs opacity-60 mb-2">CURRENT BRANCH</div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] rounded">
                        <GitBranch className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">main</span>
                    </div>
                </div>

                {/* Changes */}
                <div className="mb-6">
                    <div className="text-xs opacity-60 mb-2">CHANGES (0)</div>
                    <div className="text-center py-8 opacity-60">
                        <p className="text-sm">No changes detected</p>
                        <p className="text-xs mt-2">Make changes to your files to see them here</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <div className="text-xs opacity-60 mb-2">QUICK ACTIONS</div>
                    <div className="space-y-2">
                        <button className="w-full px-3 py-2 bg-[#2a2a2a] hover:bg-[#3c3c3c] rounded text-sm text-left flex items-center gap-2 transition-colors">
                            <GitPullRequest className="w-4 h-4" />
                            Create Pull Request
                        </button>
                        <button className="w-full px-3 py-2 bg-[#2a2a2a] hover:bg-[#3c3c3c] rounded text-sm text-left flex items-center gap-2 transition-colors">
                            <GitBranch className="w-4 h-4" />
                            Create Branch
                        </button>
                        <button className="w-full px-3 py-2 bg-[#2a2a2a] hover:bg-[#3c3c3c] rounded text-sm text-left flex items-center gap-2 transition-colors">
                            <Plus className="w-4 h-4" />
                            Initialize Repository
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                    <p className="text-xs opacity-80">
                        💡 <strong>Git Integration</strong>
                        <br />
                        Full Git support coming soon. You'll be able to commit, push, pull, and manage branches directly from the editor.
                    </p>
                </div>
            </div>
        </div>
    );
}
