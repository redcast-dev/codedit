import {
    Files,
    Search,
    GitBranch,
    Bot,
    Settings,
    Terminal as TerminalIcon,
    Package
} from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * VS Code-style Activity Bar (left edge)
 */
export default function ActivityBar({ activeView, onViewChange, theme = 'dark' }) {
    const activities = [
        { id: 'explorer', icon: Files, label: 'Explorer', shortcut: 'Ctrl+Shift+E' },
        { id: 'search', icon: Search, label: 'Search', shortcut: 'Ctrl+Shift+F' },
        { id: 'source-control', icon: GitBranch, label: 'Source Control', shortcut: 'Ctrl+Shift+G' },
        { id: 'ai-agents', icon: Bot, label: 'AI Agents', shortcut: 'Ctrl+Shift+A' },
        { id: 'extensions', icon: Package, label: 'Extensions', shortcut: 'Ctrl+Shift+X' },
    ];

    const bottomActivities = [
        { id: 'terminal', icon: TerminalIcon, label: 'Terminal', shortcut: 'Ctrl+`' },
        { id: 'settings', icon: Settings, label: 'Settings', shortcut: 'Ctrl+,' },
    ];

    const bgColor = theme === 'dark' ? 'bg-[#333333]' : 'bg-[#2c2c2c]';
    const activeColor = theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-[#2c2c2c]';
    const hoverColor = theme === 'dark' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-[#3e3e3e]';

    return (
        <div className={cn(
            "w-12 flex flex-col items-center py-2",
            bgColor,
            "border-r border-[#1e1e1e]"
        )}>
            {/* Top activities */}
            <div className="flex-1 flex flex-col gap-1 w-full">
                {activities.map((activity) => {
                    const Icon = activity.icon;
                    const isActive = activeView === activity.id;

                    return (
                        <button
                            key={activity.id}
                            onClick={() => onViewChange(activity.id)}
                            title={`${activity.label} (${activity.shortcut})`}
                            className={cn(
                                "w-full h-12 flex items-center justify-center relative group transition-colors",
                                hoverColor,
                                isActive && activeColor,
                                "text-white"
                            )}
                        >
                            <Icon className="w-6 h-6" />

                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#007acc]" />
                            )}

                            {/* Tooltip */}
                            <div className="absolute left-full ml-2 px-2 py-1 bg-[#3c3c3c] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                {activity.label}
                                <div className="text-[10px] text-gray-400 mt-0.5">{activity.shortcut}</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Bottom activities */}
            <div className="flex flex-col gap-1 w-full">
                {bottomActivities.map((activity) => {
                    const Icon = activity.icon;
                    const isActive = activeView === activity.id;

                    return (
                        <button
                            key={activity.id}
                            onClick={() => onViewChange(activity.id)}
                            title={`${activity.label} (${activity.shortcut})`}
                            className={cn(
                                "w-full h-12 flex items-center justify-center relative group transition-colors",
                                hoverColor,
                                isActive && activeColor,
                                "text-white"
                            )}
                        >
                            <Icon className="w-6 h-6" />

                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#007acc]" />
                            )}

                            {/* Tooltip */}
                            <div className="absolute left-full ml-2 px-2 py-1 bg-[#3c3c3c] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                {activity.label}
                                <div className="text-[10px] text-gray-400 mt-0.5">{activity.shortcut}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
