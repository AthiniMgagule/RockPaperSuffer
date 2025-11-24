import axios from "axios";
import { io, Socket } from "socket.io-client";
import { GameState, RPSResult } from "../types/game.types";

const API_URL = "http://localhost:3000/api/game";
const SOCKET_URL = "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
});

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
  onError: (error: { message: string }) => void
) => {
  socket.on("game:update", onGameUpdate);
  socket.on("rps:result", onRPSResult);
  socket.on("rps:waiting", onRPSWaiting);
  socket.on("move:made", onMoveMade);
  socket.on("game:end", onGameEnd);
  socket.on("error", onError);
};

export const cleanupSocketListeners = () => {
  socket.off("game:update");
  socket.off("rps:result");
  socket.off("rps:waiting");
  socket.off("move:made");
  socket.off("game:end");
  socket.off("error");
};