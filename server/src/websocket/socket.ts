import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { GameService } from "../services/GameService";
import { Player, RPSChoice, Position } from "../engine/types";

export function initializeSocket(
  httpServer: HTTPServer,
  gameService: GameService
) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join:game", async (gameId: string) => {
      try {
        socket.join(gameId);
        
        // Assign player to this socket
        const assignedPlayer = await gameService.assignPlayerToSocket(gameId, socket.id);
        
        // Get game state
        const gameState = await gameService.getGameState(gameId);
        
        if (gameState) {
          // Send player assignment
          socket.emit("player:assigned", { player: assignedPlayer });
          
          // Send game state
          socket.emit("game:update", gameState);
          
          // Notify room that a player joined
          io.to(gameId).emit("player:joined", { 
            player: assignedPlayer,
            socketId: socket.id 
          });
        }
      } catch (error: any) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on(
      "rps:submit",
      async (data: { gameId: string; choice: RPSChoice }) => {
        try {
          // Get player from socket
          const player = await gameService.getPlayerBySocket(data.gameId, socket.id);
          
          if (!player) {
            socket.emit("error", { message: "Player not assigned to this game" });
            return;
          }

          const result = await gameService.submitRPS(
            data.gameId,
            player,
            data.choice
          );

          if (result.waiting) {
            io.to(data.gameId).emit("rps:waiting", { player });
          } else {
            const gameState = await gameService.getGameState(data.gameId);
            io.to(data.gameId).emit("rps:result", result.result);
            io.to(data.gameId).emit("game:update", gameState);
          }
        } catch (error: any) {
          socket.emit("error", { message: error.message });
        }
      }
    );

    socket.on(
      "move:make",
      async (data: { gameId: string; position: Position }) => {
        try {
          // Get player from socket
          const player = await gameService.getPlayerBySocket(data.gameId, socket.id);
          
          if (!player) {
            socket.emit("error", { message: "Player not assigned to this game" });
            return;
          }

          const gameState = await gameService.makeMove(
            data.gameId,
            player,
            data.position
          );
          
          io.to(data.gameId).emit("move:made", {
            player,
            position: data.position,
          });
          io.to(data.gameId).emit("game:update", gameState);

          if (gameState.winner) {
            io.to(data.gameId).emit("game:end", {
              winner: gameState.winner,
            });
          }
        } catch (error: any) {
          socket.emit("error", { message: error.message });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Note: We keep the player assignment in the database
      // so they can reconnect with the same player
    });
  });

  return io;
}