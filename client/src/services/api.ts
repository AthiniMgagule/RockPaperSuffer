// src/services/api.ts
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { GameState, RPSResult, Player } from "../types/game.types";
import { authService } from "./authService";

const API_URL = "http://localhost:3000/api/game";
const SOCKET_URL = "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to game API requests
api.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
});

// Authenticate socket connection when available
export const authenticateSocket = () => {
  const token = authService.getAccessToken();
  if (token) {
    socket.emit('auth:connect', token);
  }
};

export const gameApi = {
  createGame: async (): Promise<GameState> => {
    const response = await api.post("/new");
    return response.data;
  },

  getGame: async (gameId: string): Promise<GameState> => {
    const response = await api.get(`/${gameId}`);
    return response.data;
  },

  getAllGames: async (): Promise<GameState[]> => {
    const response = await api.get("/");
    return response.data;
  },
};

export const setupSocketListeners = (
  onGameUpdate: (state: GameState) => void,
  onRPSResult: (result: RPSResult) => void,
  onRPSWaiting: () => void,
  onMoveMade: (data: any) => void,
  onGameEnd: (data: { winner: string }) => void,
  onError: (error: { message: string }) => void,
  onPlayerAssigned?: (data: { player: Player }) => void
) => {
  socket.on("game:update", onGameUpdate);
  socket.on("rps:result", onRPSResult);
  socket.on("rps:waiting", onRPSWaiting);
  socket.on("move:made", onMoveMade);
  socket.on("game:end", onGameEnd);
  socket.on("error", onError);
  
  if (onPlayerAssigned) {
    socket.on("player:assigned", onPlayerAssigned);
  }

  // Auth-related socket events
  socket.on("auth:success", (data) => {
    console.log("Socket authenticated:", data.username);
  });

  socket.on("auth:error", (error) => {
    console.error("Socket auth error:", error.message);
  });
};

export const cleanupSocketListeners = () => {
  socket.off("game:update");
  socket.off("rps:result");
  socket.off("rps:waiting");
  socket.off("move:made");
  socket.off("game:end");
  socket.off("error");
  socket.off("player:assigned");
  socket.off("auth:success");
  socket.off("auth:error");
};

// Helper to join game with authentication
export const joinGameWithAuth = (gameId: string) => {
  const token = authService.getAccessToken();
  socket.emit("join:game", { gameId, token });
};