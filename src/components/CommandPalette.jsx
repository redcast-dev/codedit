import { useState, useEffect, useRef } from "react";

export default function CommandPalette({ isOpen, onClose, onCommand }) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = [
    { id: "new-file", label: "New File", icon: "📄", category: "File" },
    { id: "save", label: "Save File", icon: "💾", category: "File", shortcut: "Ctrl+S" },
    { id: "delete-file", label: "Delete File", icon: "🗑️", category: "File" },
    { id: "ai-generate", label: "AI: Generate Code", icon: "✨", category: "AI" },
    { id: "ai-refactor", label: "AI: Refactor Code", icon: "🔧", category: "AI" },
    { id: "ai-explain", label: "AI: Explain Code", icon: "💡", category: "AI" },
    { id: "ai-fix", label: "AI: Fix Bugs", icon: "🐛", category: "AI" },
    { id: "ai-test", label: "AI: Generate Tests", icon: "✅", category: "AI" },
    { id: "format", label: "Format Code", icon: "📐", category: "Edit", shortcut: "Shift+Alt+F" },
    { id: "toggle-theme", label: "Toggle Theme", icon: "🌓", category: "View" },
    { id: "toggle-preview", label: "Toggle Preview", icon: "👁️", category: "View" },
    { id: "toggle-terminal", label: "Toggle Terminal", icon: "⌨️", category: "View" },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  function handleSelect(command) {
    onCommand(command.id);
    setSearch("");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Search input */}
        <div className="p-4 border-b">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="w-full px-4 py-2 text-lg border-none outline-none"
          />
        </div>

        {/* Commands list */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No commands found</div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id}
                onClick={() => handleSelect(cmd)}
                className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                  idx === selectedIndex ? "bg-blue-50 border-l-4 border-blue-600" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cmd.icon}</span>
                  <div>
                    <div className="font-medium text-gray-800">{cmd.label}</div>
                    <div className="text-xs text-gray-500">{cmd.category}</div>
                  </div>
                </div>
                {cmd.shortcut && (
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {cmd.shortcut}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-600 flex items-center justify-between">
          <div>
            <kbd className="px-2 py-1 bg-white border rounded">↑↓</kbd> Navigate
            <kbd className="ml-2 px-2 py-1 bg-white border rounded">Enter</kbd> Select
            <kbd className="ml-2 px-2 py-1 bg-white border rounded">Esc</kbd> Close
          </div>
        </div>
      </div>
    </div>
  );
}
