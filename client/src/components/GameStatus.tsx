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
      return <div className="winner-message draw">Game ended in a draw!</div>;
    }

    const isWinner = gameState.winner === localPlayer;
    return (
      <div className={`winner-message ${isWinner ? "win" : "lose"}`}>
        {isWinner ? "🎉 You won!" : `Player ${gameState.winner} won!`}
      </div>
    );
  };

  return (
    <div className="game-status">
      <div className="status-header">
        <h2>Rock Paper Suffer</h2>
        <div className="player-info">
          You are playing as: <strong>{localPlayer}</strong>
        </div>
      </div>

      {getWinnerMessage()}

      {!gameState.winner && (
        <div className="phase-info">
          <div className="phase-badge">{gameState.phase} Phase</div>
          <p className="phase-description">{getPhaseDescription()}</p>
        </div>
      )}

      <div className="moves-info">
        <div className="move-counter">
          <span className="label">X Moves:</span>
          <span className="value">
            {gameState.movesMade.X} / {gameState.rpsRound.movesAllowed.X}
          </span>
        </div>
        <div className="move-counter">
          <span className="label">O Moves:</span>
          <span className="value">
            {gameState.movesMade.O} / {gameState.rpsRound.movesAllowed.O}
          </span>
        </div>
      </div>

      <div className="game-id">
        <small>Game ID: {gameState.id}</small>
      </div>
    </div>
  );
};