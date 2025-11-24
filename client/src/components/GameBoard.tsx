import React from "react";
import { MicroBoard } from "./MicroBoard";
import { useGameStore } from "../store/gameStore";
import { Position } from "../types/game.types";

export const GameBoard: React.FC = () => {
  const { gameState, makeMove, lastMove, localPlayer } = useGameStore();

  if (!gameState) {
    return <div className="game-board-placeholder">No game loaded</div>;
  }

  const handleCellClick = (position: Position) => {
    makeMove(position);
  };

  const isMyTurn = gameState.phase === "MOVE";
  const canMove = gameState.movesMade[localPlayer] < gameState.rpsRound.movesAllowed[localPlayer];

  return (
    <div className="game-board">
      <div className="main-grid">
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