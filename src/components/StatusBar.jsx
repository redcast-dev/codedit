import {
    GitBranch,
    AlertCircle,
    CheckCircle,
    Wifi,
    WifiOff,
    Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getLanguageInfo } from '../lib/utils';

/**
 * VS Code-style Status Bar (bottom)
 */
export default function StatusBar({
    theme = 'dark',
    gitBranch = 'main',
    gitStatus = 'synced', // synced, ahead, behind, conflict
    language = 'javascript',
    lineNumber = 1,
    columnNumber = 1,
    totalLines = 0,
    errors = 0,
    warnings = 0,
    isOnline = true,
    notifications = 0
}) {
    const langInfo = getLanguageInfo(language);

    const bgColor = theme === 'dark' ? 'bg-[#007acc]' : 'bg-[#007acc]';
    const textColor = 'text-white';

    return (
        <div className={cn(
            "h-6 flex items-center justify-between px-2 text-xs",
            bgColor,
            textColor,
            "select-none"
        )}>
            {/* Left section */}
            <div className="flex items-center gap-3">
                {/* Git branch */}
                <button
                    className="flex items-center gap-1.5 hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors"
                    title="Switch branch"
                >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>{gitBranch}</span>
                    {gitStatus === 'ahead' && <span className="text-[10px]">↑</span>}
                    {gitStatus === 'behind' && <span className="text-[10px]">↓</span>}
                    {gitStatus === 'conflict' && <span className="text-[10px]">⚠</span>}
                </button>

                {/* Errors & Warnings */}
                {(errors > 0 || warnings > 0) && (
                    <button
                        className="flex items-center gap-2 hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors"
                        title="Show problems"
                    >
                        {errors > 0 && (
                            <div className="flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-red-300" />
                                <span>{errors}</span>
                            </div>
                        )}
                        {warnings > 0 && (
                            <div className="flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-yellow-300" />
                                <span>{warnings}</span>
                            </div>
                        )}
                    </button>
                )}

                {/* Online status */}
                <div className="flex items-center gap-1" title={isOnline ? 'Connected' : 'Offline'}>
                    {isOnline ? (
                        <Wifi className="w-3.5 h-3.5" />
                    ) : (
                        <WifiOff className="w-3.5 h-3.5 text-red-300" />
                    )}
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
                {/* Language */}
                <button
                    className="hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors"
                    title="Select language mode"
                >
                    {langInfo.label}
                </button>

                {/* Line & Column */}
                <button
                    className="hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors"
                    title="Go to line"
                >
                    Ln {lineNumber}, Col {columnNumber}
                </button>

                {/* Total lines */}
                <div className="opacity-80">
                    {totalLines} lines
                </div>

                {/* Notifications */}
                {notifications > 0 && (
                    <button
                        className="flex items-center gap-1 hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors relative"
                        title="Notifications"
                    >
                        <Bell className="w-3.5 h-3.5" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] flex items-center justify-center">
                            {notifications}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
