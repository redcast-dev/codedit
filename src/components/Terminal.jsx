import { useState, useRef, useEffect } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { SearchAddon } from "@xterm/addon-search";
import { terminalService } from "../lib/terminalService";
import "@xterm/xterm/css/xterm.css";

export default function Terminal({ isVisible, onClose }) {
  const [terminals, setTerminals] = useState([]);
  const [activeTerminalId, setActiveTerminalId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const terminalRefs = useRef(new Map());
  const containerRef = useRef(null);

  useEffect(() => {
    if (isVisible && terminals.length === 0) {
      createNewTerminal();
    }
  }, [isVisible]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      terminals.forEach(terminal => {
        if (terminal.xterm) {
          terminal.xterm.dispose();
        }
        if (terminal.id) {
          terminalService.killTerminal(terminal.id);
        }
      });
    };
  }, []);

  const createNewTerminal = async (shell = null) => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const terminalInfo = await terminalService.createTerminal({
        shell: shell,
        cols: 80,
        rows: 24,
      });

      const xterm = new XTerm({
        theme: {
          background: '#1f2937',
          foreground: '#f3f4f6',
          cursor: '#f3f4f6',
          selection: '#374151',
          black: '#1f2937',
          red: '#ef4444',
          green: '#10b981',
          yellow: '#f59e0b',
          blue: '#3b82f6',
          magenta: '#8b5cf6',
          cyan: '#06b6d4',
          white: '#f3f4f6',
          brightBlack: '#374151',
          brightRed: '#f87171',
          brightGreen: '#34d399',
          brightYellow: '#fbbf24',
          brightBlue: '#60a5fa',
          brightMagenta: '#a78bfa',
          brightCyan: '#22d3ee',
          brightWhite: '#ffffff',
        },
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: 14,
        lineHeight: 1.2,
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 1000,
        tabStopWidth: 4,
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      const searchAddon = new SearchAddon();

      xterm.loadAddon(fitAddon);
      xterm.loadAddon(webLinksAddon);
      xterm.loadAddon(searchAddon);

      const newTerminal = {
        id: terminalInfo.id,
        xterm,
        fitAddon,
        searchAddon,
        shell: terminalInfo.shell,
        cwd: terminalInfo.cwd,
        title: `${terminalInfo.shell} - ${terminalInfo.cwd}`,
      };

      // Set up terminal callbacks
      terminalService.setTerminalCallbacks(terminalInfo.id, {
        onData: (data) => {
          xterm.write(data);
        },
        onExit: (exitCode) => {
          xterm.write(`\r\n\x1b[31mProcess exited with code ${exitCode}\x1b[0m\r\n`);
          setTerminals(prev => prev.filter(t => t.id !== terminalInfo.id));
          if (activeTerminalId === terminalInfo.id) {
            const remaining = terminals.filter(t => t.id !== terminalInfo.id);
            setActiveTerminalId(remaining.length > 0 ? remaining[0].id : null);
          }
        },
        onError: (error) => {
          xterm.write(`\r\n\x1b[31mTerminal error: ${error}\x1b[0m\r\n`);
        },
      });

      // Handle user input
      xterm.onData((data) => {
        terminalService.writeToTerminal(terminalInfo.id, data);
      });

      // Handle terminal resize
      xterm.onResize(({ cols, rows }) => {
        terminalService.resizeTerminal(terminalInfo.id, cols, rows);
      });

      setTerminals(prev => [...prev, newTerminal]);
      setActiveTerminalId(terminalInfo.id);

    } catch (error) {
      console.error('Failed to create terminal:', error);
      setConnectionError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const closeTerminal = (terminalId) => {
    const terminal = terminals.find(t => t.id === terminalId);
    if (terminal) {
      terminal.xterm.dispose();
      terminalService.killTerminal(terminalId);
      setTerminals(prev => prev.filter(t => t.id !== terminalId));
      
      if (activeTerminalId === terminalId) {
        const remaining = terminals.filter(t => t.id !== terminalId);
        setActiveTerminalId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const clearTerminal = () => {
    const activeTerminal = terminals.find(t => t.id === activeTerminalId);
    if (activeTerminal) {
      activeTerminal.xterm.clear();
    }
  };

  useEffect(() => {
    if (activeTerminalId && containerRef.current) {
      const terminal = terminals.find(t => t.id === activeTerminalId);
      if (terminal && !terminalRefs.current.has(activeTerminalId)) {
        const terminalElement = containerRef.current.querySelector('.terminal-container');
        if (terminalElement) {
          terminal.xterm.open(terminalElement);
          terminal.fitAddon.fit();
          terminalRefs.current.set(activeTerminalId, terminal);
          
          // Focus the terminal
          setTimeout(() => terminal.xterm.focus(), 100);
        }
      }
    }
  }, [activeTerminalId, terminals]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const activeTerminal = terminals.find(t => t.id === activeTerminalId);
      if (activeTerminal) {
        setTimeout(() => activeTerminal.fitAddon.fit(), 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTerminalId, terminals]);

  if (!isVisible) return null;

  const activeTerminal = terminals.find(t => t.id === activeTerminalId);

  return (
    <div className="h-full bg-gray-900 text-gray-100 flex flex-col">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Terminal</span>
          {activeTerminal && (
            <span className="text-xs text-gray-400">
              {activeTerminal.shell} - {activeTerminal.cwd}
            </span>
          )}
          {isConnecting && (
            <span className="text-xs text-yellow-400">Connecting...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => createNewTerminal('powershell')}
            className="text-xs px-2 py-1 hover:bg-gray-700 rounded"
            title="New PowerShell Terminal"
            disabled={isConnecting}
          >
            PowerShell
          </button>
          <button
            onClick={() => createNewTerminal('cmd')}
            className="text-xs px-2 py-1 hover:bg-gray-700 rounded"
            title="New Command Prompt"
            disabled={isConnecting}
          >
            CMD
          </button>
          <button
            onClick={clearTerminal}
            className="text-xs px-2 py-1 hover:bg-gray-700 rounded"
            disabled={!activeTerminal}
          >
            Clear
          </button>
          {activeTerminal && (
            <button
              onClick={() => closeTerminal(activeTerminalId)}
              className="text-xs px-2 py-1 hover:bg-gray-700 rounded text-red-400"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Terminal tabs */}
      {terminals.length > 1 && (
        <div className="flex bg-gray-800 border-b border-gray-700">
          {terminals.map((terminal) => (
            <button
              key={terminal.id}
              onClick={() => setActiveTerminalId(terminal.id)}
              className={`px-3 py-1 text-xs border-r border-gray-700 ${
                activeTerminalId === terminal.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-750'
              }`}
            >
              {terminal.shell}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTerminal(terminal.id);
                }}
                className="ml-2 text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Terminal content */}
      <div ref={containerRef} className="flex-1 relative">
        {connectionError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-red-400 mb-2">Connection Error</div>
              <div className="text-sm text-gray-400 mb-4">{connectionError}</div>
              <button
                onClick={() => createNewTerminal()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry Connection
              </button>
            </div>
          </div>
        ) : terminals.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 mb-4">No terminals open</div>
              <button
                onClick={() => createNewTerminal()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isConnecting}
              >
                {isConnecting ? 'Creating...' : 'Create Terminal'}
              </button>
            </div>
          </div>
        ) : (
          <div className="terminal-container h-full w-full" />
        )}
      </div>
    </div>
  );
}
