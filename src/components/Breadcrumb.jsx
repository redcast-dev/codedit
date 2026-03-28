import { ChevronRight, File } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * VS Code-style Breadcrumb navigation
 */
export default function Breadcrumb({
    path = '',
    theme = 'dark',
    onNavigate
}) {
    const parts = path.split('/').filter(Boolean);

    const bgColor = theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-[#cccccc]' : 'text-[#333333]';
    const hoverBg = theme === 'dark' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-[#e8e8e8]';

    if (parts.length === 0) {
        return null;
    }

    return (
        <div className={cn(
            "flex items-center gap-1 px-4 py-1.5 text-xs border-b",
            bgColor,
            textColor,
            theme === 'dark' ? 'border-[#252526]' : 'border-[#e5e5e5]'
        )}>
            <File className="w-3.5 h-3.5 opacity-60" />

            {parts.map((part, index) => {
                const isLast = index === parts.length - 1;
                const pathUpToHere = parts.slice(0, index + 1).join('/');

                return (
                    <div key={index} className="flex items-center gap-1">
                        <button
                            onClick={() => onNavigate && onNavigate(pathUpToHere)}
                            className={cn(
                                "px-1.5 py-0.5 rounded transition-colors",
                                !isLast && hoverBg,
                                isLast && "font-medium"
                            )}
                        >
                            {part}
                        </button>

                        {!isLast && (
                            <ChevronRight className="w-3 h-3 opacity-40" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
