import { X, Circle } from 'lucide-react';
import { cn, getLanguageInfo } from '../lib/utils';

/**
 * VS Code-style Editor Tabs
 */
export default function EditorTabs({
    tabs = [],
    activeTab,
    onTabClick,
    onTabClose,
    theme = 'dark'
}) {
    const activeBg = theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white';
    const inactiveBg = theme === 'dark' ? 'bg-[#2d2d2d]' : 'bg-[#ececec]';
    const activeText = theme === 'dark' ? 'text-white' : 'text-[#333333]';
    const inactiveText = theme === 'dark' ? 'text-[#969696]' : 'text-[#6b6b6b]';
    const borderColor = theme === 'dark' ? 'border-[#252526]' : 'border-[#e5e5e5]';
    const hoverBg = theme === 'dark' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-[#e8e8e8]';

    return (
        <div className={cn(
            "flex items-center overflow-x-auto scrollbar-thin",
            borderColor,
            "border-b",
            theme === 'dark' ? 'bg-[#252526]' : 'bg-[#f3f3f3]'
        )}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const langInfo = getLanguageInfo(tab.language);

                return (
                    <div
                        key={tab.id}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[200px] cursor-pointer group relative",
                            "border-r",
                            borderColor,
                            isActive ? activeBg : inactiveBg,
                            isActive ? activeText : inactiveText,
                            !isActive && hoverBg,
                            "transition-colors"
                        )}
                        onClick={() => onTabClick(tab.id)}
                    >
                        {/* Language indicator dot */}
                        <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: langInfo.color }}
                        />

                        {/* File name */}
                        <span className="flex-1 truncate text-sm">
                            {tab.name}
                        </span>

                        {/* Dirty indicator (unsaved changes) */}
                        {tab.isDirty && (
                            <Circle className="w-2 h-2 fill-current flex-shrink-0" />
                        )}

                        {/* Close button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onTabClose(tab.id);
                            }}
                            className={cn(
                                "p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                                "hover:bg-white/10"
                            )}
                            title="Close"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>

                        {/* Active tab indicator */}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007acc]" />
                        )}
                    </div>
                );
            })}

            {/* Add new tab button */}
            <button
                className={cn(
                    "px-3 py-2 flex items-center justify-center",
                    hoverBg,
                    inactiveText,
                    "transition-colors"
                )}
                title="New file"
            >
                <span className="text-lg leading-none">+</span>
            </button>
        </div>
    );
}
