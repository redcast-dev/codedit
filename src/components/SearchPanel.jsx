import { Search as SearchIcon, X, FileText, Folder } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

/**
 * Search Panel - Find in files
 */
export default function SearchPanel({ theme = 'dark', files = {}, onFileSelect }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const bgColor = theme === 'dark' ? 'bg-[#252526]' : 'bg-[#f3f3f3]';
    const borderColor = theme === 'dark' ? 'border-[#3c3c3c]' : 'border-[#e5e5e5]';
    const textColor = theme === 'dark' ? 'text-[#cccccc]' : 'text-[#333333]';

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const results = [];

        // Search through all files
        Object.entries(files).forEach(([path, file]) => {
            if (!file.content) return;

            const lines = file.content.split('\n');
            lines.forEach((line, index) => {
                if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
                    results.push({
                        file: path,
                        line: index + 1,
                        content: line.trim(),
                        fileName: file.name || path
                    });
                }
            });
        });

        setSearchResults(results);
        setIsSearching(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className={cn("h-full flex flex-col", bgColor, textColor)}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#3c3c3c]">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Search
                </h3>

                {/* Search Input */}
                <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded border",
                    theme === 'dark' ? 'bg-[#3c3c3c] border-[#555]' : 'bg-white border-gray-300'
                )}>
                    <SearchIcon className="w-4 h-4 opacity-60" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search in files..."
                        className="flex-1 bg-transparent outline-none text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                            }}
                            className="opacity-60 hover:opacity-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <button
                    onClick={handleSearch}
                    className="w-full mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                    Search
                </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
                {searchResults.length > 0 ? (
                    <div className="p-2">
                        <div className="text-xs opacity-60 px-2 py-1">
                            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} in {new Set(searchResults.map(r => r.file)).size} file{new Set(searchResults.map(r => r.file)).size !== 1 ? 's' : ''}
                        </div>

                        {searchResults.map((result, index) => (
                            <div
                                key={index}
                                onClick={() => onFileSelect && onFileSelect(result.file)}
                                className={cn(
                                    "px-3 py-2 cursor-pointer rounded transition-colors",
                                    theme === 'dark' ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-200'
                                )}
                            >
                                <div className="flex items-center gap-2 text-xs mb-1">
                                    <FileText className="w-3 h-3 opacity-60" />
                                    <span className="font-medium">{result.fileName}</span>
                                    <span className="opacity-60">:{result.line}</span>
                                </div>
                                <div className="text-xs opacity-80 pl-5 truncate">
                                    {result.content}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : searchQuery && !isSearching ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <SearchIcon className="w-12 h-12 opacity-20 mb-3" />
                        <p className="text-sm opacity-60">No results found</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <SearchIcon className="w-12 h-12 opacity-20 mb-3" />
                        <p className="text-sm opacity-60">Enter a search term to find in files</p>
                    </div>
                )}
            </div>
        </div>
    );
}
