import { create } from "zustand";
import { GameState, Player, RPSChoice, Position, RPSResult } from "../types/game.types";
import { socket } from "../services/api";

interface GameStore {
  gameState: GameState | null;
  localPlayer: Player;
  showRPSModal: boolean;
  rpsResult: RPSResult | null;
  error: string | null;
  lastMove: Position | null;

  setGameState: (state: GameState) => void;
  setLocalPlayer: (player: Player) => void;
  setShowRPSModal: (show: boolean) => void;
  setRPSResult: (result: RPSResult | null) => void;
  setError: (error: string | null) => void;
  setLastMove: (move: Position | null) => void;
  submitRPS: (choice: RPSChoice) => void;
  makeMove: (position: Position) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  localPlayer: "X",
  showRPSModal: false,
  rpsResult: null,
  error: null,
  lastMove: null,

  setGameState: (state) => set({ gameState: state }),
  
  setLocalPlayer: (player) => set({ localPlayer: player }),
  
  setShowRPSModal: (show) => set({ showRPSModal: show }),
  
  setRPSResult: (result) => set({ rpsResult: result }),
  
  setError: (error) => set({ error }),
  
  setLastMove: (move) => {
    set({ lastMove: move });
    // Clear after animation
    setTimeout(() => set({ lastMove: null }), 500);
  },

  submitRPS: (choice) => {
    const { gameState, localPlayer } = get();
    if (!gameState) return;

    socket.emit("rps:submit", {
      gameId: gameState.id,
      player: localPlayer,
      choice,
    });

    set({ showRPSModal: false });
  },

  makeMove: (position) => {
    const { gameState, localPlayer } = get();
    if (!gameState) return;

    socket.emit("move:make", {
      gameId: gameState.id,
      player: localPlayer,
      position,
    });
  },

  reset: () =>
    set({
      gameState: null,
      showRPSModal: false,
      rpsResult: null,
      error: null,
      lastMove: null,
    }),
}));