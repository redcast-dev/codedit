import { Folder, Menu, Minimize2, Maximize2, X, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * VS Code-style Title Bar (top)
 */
export default function TitleBar({
    theme = 'dark',
    projectName = 'Untitled',
    folderPath = null,
    onOpenFolder,
    onMinimize,
    onMaximize,
    onClose,
    onSettings,
    onMenu
}) {
    const bgColor = theme === 'dark' ? 'bg-[#3c3c3c]' : 'bg-[#dddddd]';
    const textColor = theme === 'dark' ? 'text-[#cccccc]' : 'text-[#333333]';
    const hoverColor = theme === 'dark' ? 'hover:bg-[#505050]' : 'hover:bg-[#c8c8c8]';

    const handleMinimize = () => {
        if (onMinimize) {
            onMinimize();
        } else {
            // Fallback: Try to minimize window if running in Electron or similar
            if (window.electronAPI?.minimize) {
                window.electronAPI.minimize();
            } else {
                console.log('Minimize window');
            }
        }
    };

    const handleMaximize = () => {
        if (onMaximize) {
            onMaximize();
        } else {
            // Fallback: Try to maximize/restore window
            if (window.electronAPI?.maximize) {
                window.electronAPI.maximize();
            } else if (document.fullscreenEnabled) {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            } else {
                console.log('Maximize/Restore window');
            }
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            // Fallback: Try to close window
            if (window.electronAPI?.close) {
                window.electronAPI.close();
            } else {
                const confirmClose = window.confirm('Are you sure you want to close CODEDIT?');
                if (confirmClose) {
                    window.close();
                }
            }
        }
    };

    return (
        <div className={cn(
            "h-9 flex items-center justify-between px-2",
            bgColor,
            textColor,
            "select-none border-b",
            theme === 'dark' ? 'border-[#1e1e1e]' : 'border-[#e5e5e5]'
        )}>
            {/* Left section - Menu & Project name */}
            <div className="flex items-center gap-2">
                {/* Menu button */}
                <button
                    className={cn(
                        "p-1.5 rounded transition-colors",
                        hoverColor
                    )}
                    title="Application menu"
                    onClick={onMenu}
                >
                    <Menu className="w-4 h-4" />
                </button>

                {/* Project name */}
                <div className="flex items-center gap-2 px-2">
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                            CODEDIT
                        </div>
                        {folderPath && (
                            <>
                                <span className="text-gray-500">—</span>
                                <div className="flex items-center gap-1.5 text-sm">
                                    <Folder className="w-3.5 h-3.5" />
                                    <span>{projectName}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Center section - Could show file path or other info */}
            <div className="flex-1 flex items-center justify-center">
                {!folderPath && (
                    <button
                        onClick={onOpenFolder}
                        className={cn(
                            "text-xs px-3 py-1 rounded transition-colors flex items-center gap-1.5",
                            hoverColor
                        )}
                    >
                        <Folder className="w-3.5 h-3.5" />
                        Open Folder
                    </button>
                )}
            </div>

            {/* Right section - Settings & Window controls */}
            <div className="flex items-center">
                {onSettings && (
                    <button
                        onClick={onSettings}
                        className={cn(
                            "p-1.5 rounded transition-colors",
                            hoverColor
                        )}
                        title="Settings"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={handleMinimize}
                    className={cn(
                        "p-1.5 rounded transition-colors",
                        hoverColor
                    )}
                    title="Minimize"
                >
                    <Minimize2 className="w-4 h-4" />
                </button>
                <button
                    onClick={handleMaximize}
                    className={cn(
                        "p-1.5 rounded transition-colors",
                        hoverColor
                    )}
                    title="Maximize/Restore"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
                <button
                    onClick={handleClose}
                    className={cn(
                        "p-1.5 rounded transition-colors hover:bg-red-600 hover:text-white"
                    )}
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
