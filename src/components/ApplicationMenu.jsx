import { X, FileText, FolderOpen, Save, Settings, Info, HelpCircle, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Application Menu (like VS Code's File menu)
 */
export default function ApplicationMenu({ isOpen, onClose, theme = 'dark', onAction }) {
    if (!isOpen) return null;

    const bgColor = theme === 'dark' ? 'bg-[#252526]' : 'bg-white';
    const borderColor = theme === 'dark' ? 'border-[#3c3c3c]' : 'border-gray-200';
    const hoverColor = theme === 'dark' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-100';

    const menuItems = [
        { id: 'new-file', label: 'New File', icon: FileText, shortcut: 'Ctrl+N' },
        { id: 'open-folder', label: 'Open Folder', icon: FolderOpen, shortcut: 'Ctrl+O' },
        { id: 'save', label: 'Save', icon: Save, shortcut: 'Ctrl+S' },
        { type: 'separator' },
        { id: 'settings', label: 'Settings', icon: Settings, shortcut: 'Ctrl+,' },
        { id: 'about', label: 'About CODEDIT', icon: Info },
        { id: 'help', label: 'Help', icon: HelpCircle, shortcut: 'F1' },
    ];

    const handleAction = (id) => {
        if (onAction) {
            onAction(id);
        }
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Menu */}
            <div className={cn(
                "fixed top-9 left-2 z-50 w-64 rounded-lg shadow-2xl border overflow-hidden",
                bgColor,
                borderColor
            )}>
                {menuItems.map((item, index) => {
                    if (item.type === 'separator') {
                        return (
                            <div
                                key={`separator-${index}`}
                                className={cn("h-px my-1", borderColor)}
                            />
                        );
                    }

                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleAction(item.id)}
                            className={cn(
                                "w-full px-4 py-2 flex items-center justify-between text-sm transition-colors",
                                hoverColor
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-4 h-4 opacity-60" />
                                <span>{item.label}</span>
                            </div>
                            {item.shortcut && (
                                <span className="text-xs opacity-40">{item.shortcut}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </>
    );
}
