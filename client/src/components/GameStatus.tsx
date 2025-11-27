import React from "react";
import { useGameStore } from "../store/gameStore";

export const GameStatus: React.FC = () => {
  const { gameState, localPlayer } = useGameStore();

  if (!gameState) return null;

  const getPhaseDescription = () => {
    if (gameState.phase === "RPS") {
      return "Waiting for RPS selections...";
    }

    const movesLeft = gameState.rpsRound.movesAllowed[localPlayer] - gameState.movesMade[localPlayer];
    
    if (movesLeft > 0) {
      return `Your turn! ${movesLeft} move${movesLeft > 1 ? 's' : ''} remaining`;
    }

    return "Waiting for opponent...";
  };

  const getWinnerMessage = () => {
    if (!gameState.winner) return null;

    if (gameState.winner === "DRAW") {
      return (
        <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50 text-yellow-200 text-center font-bold">
          Game ended in a draw!
        </div>
      );
    }

    const isWinner = gameState.winner === localPlayer;
    return (
      <div className={`p-4 rounded-xl text-center font-bold border-2 ${
        isWinner 
          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-200' 
          : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/50 text-red-200'
      }`}>
        {isWinner ? "🎉 You won!" : `Player ${gameState.winner} won!`}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 rounded-2xl shadow-xl border-2 border-slate-700 p-6 backdrop-blur-sm">
      <div className="mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
          Game Status
        </h2>
        <div className="px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
          <span className="text-slate-400">Playing as: </span>
          <strong className="text-cyan-400 text-lg">{localPlayer}</strong>
        </div>
      </div>

      {getWinnerMessage()}

      {!gameState.winner && (
        <div className="mt-4 space-y-3">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-full">
            <span className="text-cyan-300 font-semibold">{gameState.phase} Phase</span>
          </div>
          <p className="text-slate-300">{getPhaseDescription()}</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
          <span className="block text-sm text-slate-400 mb-1">X Moves</span>
          <span className="text-xl font-bold text-cyan-400">
            {gameState.movesMade.X} / {gameState.rpsRound.movesAllowed.X}
          </span>
        </div>
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
          <span className="block text-sm text-slate-400 mb-1">O Moves</span>
          <span className="text-xl font-bold text-blue-400">
            {gameState.movesMade.O} / {gameState.rpsRound.movesAllowed.O}
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
        <small className="text-slate-500">Game ID: </small>
        <small className="text-slate-400 font-mono">{gameState.id}</small>
      </div>
    </div>
  );
};