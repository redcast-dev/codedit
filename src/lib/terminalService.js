class TerminalService {
  constructor() {
    this.ws = null;
    this.terminals = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnecting = false;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return new Promise((resolve, reject) => {
        const checkConnection = () => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            resolve();
          } else if (!this.isConnecting) {
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:3001/terminal`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('Terminal WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing terminal message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('Terminal WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.ws = null;
          
          // Attempt to reconnect if not intentionally closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              console.log(`Attempting to reconnect terminal (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
              this.connect().catch(console.error);
            }, this.reconnectDelay * this.reconnectAttempts);
          }
        };

        this.ws.onerror = (error) => {
          console.error('Terminal WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        // Timeout for connection
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  handleMessage(message) {
    const terminal = this.terminals.get(message.terminalId);
    
    switch (message.type) {
      case 'created':
        if (terminal && terminal.onCreated) {
          terminal.onCreated(message);
        }
        break;
        
      case 'data':
        if (terminal && terminal.onData) {
          terminal.onData(message.data);
        }
        break;
        
      case 'exit':
        if (terminal && terminal.onExit) {
          terminal.onExit(message.exitCode);
        }
        this.terminals.delete(message.terminalId);
        break;
        
      case 'error':
        console.error('Terminal error:', message.message);
        if (terminal && terminal.onError) {
          terminal.onError(message.message);
        }
        break;
        
      default:
        console.log('Unknown terminal message type:', message.type);
    }
  }

  async createTerminal(options = {}) {
    await this.connect();
    
    const terminalId = Date.now() + Math.random();
    
    return new Promise((resolve, reject) => {
      const terminal = {
        id: terminalId,
        onCreated: (message) => {
          resolve({
            id: terminalId,
            shell: message.shell,
            cwd: message.cwd,
          });
        },
        onError: (error) => {
          this.terminals.delete(terminalId);
          reject(new Error(error));
        },
        onData: null,
        onExit: null,
      };
      
      this.terminals.set(terminalId, terminal);
      
      this.ws.send(JSON.stringify({
        type: 'create',
        options: {
          shell: options.shell || (navigator.platform.includes('Win') ? 'powershell' : 'bash'),
          cols: options.cols || 80,
          rows: options.rows || 24,
          cwd: options.cwd,
        },
      }));

      // Timeout for terminal creation
      setTimeout(() => {
        if (this.terminals.has(terminalId)) {
          this.terminals.delete(terminalId);
          reject(new Error('Terminal creation timeout'));
        }
      }, 5000);
    });
  }

  writeToTerminal(terminalId, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'input',
        terminalId,
        data,
      }));
    }
  }

  resizeTerminal(terminalId, cols, rows) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'resize',
        terminalId,
        cols,
        rows,
      }));
    }
  }

  killTerminal(terminalId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'kill',
        terminalId,
      }));
    }
    this.terminals.delete(terminalId);
  }

  setTerminalCallbacks(terminalId, callbacks) {
    const terminal = this.terminals.get(terminalId);
    if (terminal) {
      terminal.onData = callbacks.onData;
      terminal.onExit = callbacks.onExit;
      terminal.onError = callbacks.onError;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.terminals.clear();
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const terminalService = new TerminalService();
