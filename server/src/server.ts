import 'dotenv/config';
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { GameService } from "./services/GameService";
import { createGameRoutes } from "./routes/game.routes";
import { initializeSocket } from "./websocket/socket";
import pool from "./config/database";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const gameService = new GameService();

// Initialize WebSocket
initializeSocket(httpServer, gameService);

// Routes
app.use("/api/game", createGameRoutes(gameService));

// Health check
app.get("/health", async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } catch (error) {
    res.status(503).json({ 
      status: "error", 
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
  });
  await pool.end();
  console.log('Database pool closed');
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
  console.log(`💾 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
});

export default app;