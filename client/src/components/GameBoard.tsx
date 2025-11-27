import React from "react";
import { MicroBoard } from "./MicroBoard";
import { useGameStore } from "../store/gameStore";
import { Position } from "../types/game.types";

export const GameBoard: React.FC = () => {
  const { gameState, makeMove, lastMove, localPlayer } = useGameStore();

  if (!gameState) {
    return <div className="text-slate-400 text-center">No game loaded</div>;
  }

  const handleCellClick = (position: Position) => {
    makeMove(position);
  };

  const isMyTurn = gameState.phase === "MOVE";
  const canMove = gameState.movesMade[localPlayer] < gameState.rpsRound.movesAllowed[localPlayer];

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 rounded-2xl shadow-2xl border-2 border-slate-700 p-6 backdrop-blur-sm">
      <div className="grid grid-cols-3 gap-4 max-w-3xl">
        {gameState.board.map((microboardCells, index) => (
          <MicroBoard
            key={index}
            cells={microboardCells}
            microboardIndex={index}
            state={gameState.microboards[index]}
            onCellClick={handleCellClick}
            disabled={!isMyTurn || !canMove}
            lastMove={lastMove}
          />
        ))}
      </div>
    </div>
  );
};