import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import generateRouter from "./routes/generate.js";
import refactorRouter from "./routes/refactor.js";
import executeRouter from "./routes/execute.js";
import chatRouter from "./routes/chat.js";
import { setupTerminalWebSocket } from "./routes/terminal.js";

// Load environment variables
dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/ai/generate", generateRouter);
app.use("/api/ai/refactor", refactorRouter);
app.use("/api/ai/execute", executeRouter);
app.use("/api/ai/chat", chatRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Create HTTP server
const server = createServer(app);

// Setup terminal WebSocket
setupTerminalWebSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`CODEDIT Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/ai/*`);
  console.log(`Terminal WebSocket available at ws://localhost:${PORT}/terminal`);
});
