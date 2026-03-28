import { spawn } from 'child_process';
import { WebSocketServer } from 'ws';
import os from 'os';
import path from 'path';

class TerminalManager {
  constructor() {
    this.terminals = new Map();
    this.nextId = 1;
  }

  createTerminal(ws, options = {}) {
    const terminalId = this.nextId++;
    
    // Determine shell based on OS
    let shell, shellArgs;
    if (os.platform() === 'win32') {
      // Use PowerShell by default on Windows, fallback to cmd
      shell = options.shell === 'cmd' ? 'cmd.exe' : 'powershell.exe';
      shellArgs = options.shell === 'cmd' ? ['/k'] : ['-NoLogo', '-NoExit'];
    } else {
      shell = process.env.SHELL || '/bin/bash';
      shellArgs = [];
    }

    const cwd = options.cwd || process.cwd();

    try {
      const childProcess = spawn(shell, shellArgs, {
        cwd: cwd,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: false,
      });

      // Store terminal info
      this.terminals.set(terminalId, {
        process: childProcess,
        ws: ws,
        shell: shell,
        cwd: cwd,
      });

      // Handle terminal output (stdout)
      childProcess.stdout.on('data', (data) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'data',
            terminalId,
            data: data.toString(),
          }));
        }
      });

      // Handle terminal errors (stderr)
      childProcess.stderr.on('data', (data) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'data',
            terminalId,
            data: data.toString(),
          }));
        }
      });

      // Handle terminal exit
      childProcess.on('exit', (exitCode) => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'exit',
            terminalId,
            exitCode,
          }));
        }
        this.terminals.delete(terminalId);
      });

      // Handle process errors
      childProcess.on('error', (error) => {
        console.error('Terminal process error:', error);
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: `Terminal error: ${error.message}`,
          }));
        }
        this.terminals.delete(terminalId);
      });

      // Send terminal created confirmation
      ws.send(JSON.stringify({
        type: 'created',
        terminalId,
        shell: shell,
        cwd: cwd,
      }));

      return terminalId;
    } catch (error) {
      console.error('Failed to create terminal:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: `Failed to create terminal: ${error.message}`,
      }));
      return null;
    }
  }

  writeToTerminal(terminalId, data) {
    const terminal = this.terminals.get(terminalId);
    if (terminal && terminal.process && terminal.process.stdin) {
      terminal.process.stdin.write(data);
    }
  }

  resizeTerminal(terminalId, cols, rows) {
    // Note: Basic child_process doesn't support resize like node-pty
    // This is a limitation of using child_process instead of node-pty
    console.log(`Terminal ${terminalId} resize requested: ${cols}x${rows} (not supported with child_process)`);
  }

  killTerminal(terminalId) {
    const terminal = this.terminals.get(terminalId);
    if (terminal && terminal.process) {
      terminal.process.kill();
      this.terminals.delete(terminalId);
    }
  }

  closeWebSocket(ws) {
    // Clean up all terminals associated with this WebSocket
    for (const [terminalId, terminal] of this.terminals.entries()) {
      if (terminal.ws === ws) {
        terminal.process.kill();
        this.terminals.delete(terminalId);
      }
    }
  }
}

export function setupTerminalWebSocket(server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/terminal'
  });
  
  const terminalManager = new TerminalManager();

  wss.on('connection', (ws) => {
    console.log('Terminal WebSocket connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'create':
            terminalManager.createTerminal(ws, data.options || {});
            break;
            
          case 'input':
            terminalManager.writeToTerminal(data.terminalId, data.data);
            break;
            
          case 'resize':
            terminalManager.resizeTerminal(data.terminalId, data.cols, data.rows);
            break;
            
          case 'kill':
            terminalManager.killTerminal(data.terminalId);
            break;
            
          default:
            console.log('Unknown terminal message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing terminal message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
        }));
      }
    });

    ws.on('close', () => {
      console.log('Terminal WebSocket disconnected');
      terminalManager.closeWebSocket(ws);
    });

    ws.on('error', (error) => {
      console.error('Terminal WebSocket error:', error);
      terminalManager.closeWebSocket(ws);
    });
  });

  return wss;
}
