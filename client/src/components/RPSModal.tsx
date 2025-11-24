import React, { useState } from "react";
import { RPSChoice } from "../types/game.types";
import { useGameStore } from "../store/gameStore";

export const RPSModal: React.FC = () => {
  const { showRPSModal, submitRPS, rpsResult } = useGameStore();
  const [selectedChoice, setSelectedChoice] = useState<RPSChoice | null>(null);

  if (!showRPSModal && !rpsResult) return null;

  const handleSubmit = () => {
    if (selectedChoice) {
      submitRPS(selectedChoice);
      setSelectedChoice(null);
    }
  };

  const choices: RPSChoice[] = ["ROCK", "PAPER", "SCISSORS"];

  const getEmoji = (choice: RPSChoice) => {
    switch (choice) {
      case "ROCK":
        return "🪨";
      case "PAPER":
        return "📄";
      case "SCISSORS":
        return "✂️";
    }
  };

  if (rpsResult) {
    return (
      <div className="modal-overlay">
        <div className="modal rps-result">
          <h2>RPS Result</h2>
          <div className="rps-result-display">
            <div className="rps-choice">
              <span className="player-label">Player X</span>
              <span className="choice-emoji">{getEmoji(rpsResult.xChoice)}</span>
              <span className="choice-name">{rpsResult.xChoice}</span>
            </div>
            <div className="vs">VS</div>
            <div className="rps-choice">
              <span className="player-label">Player O</span>
              <span className="choice-emoji">{getEmoji(rpsResult.oChoice)}</span>
              <span className="choice-name">{rpsResult.oChoice}</span>
            </div>
          </div>
          <div className="rps-winner">
            {rpsResult.winner === "DRAW" ? (
              <p>It's a draw! Both players get 1 move.</p>
            ) : (
              <p>
                Player {rpsResult.winner === "X_WINS" ? "X" : "O"} wins! They
                get 1 move.
              </p>
            )}
          </div>
          <button
            className="btn-primary"
            onClick={() => useGameStore.getState().setRPSResult(null)}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal rps-selection">
        <h2>Choose Your Move</h2>
        <p>Rock, Paper, Scissors!</p>
        <div className="rps-choices">
          {choices.map((choice) => (
            <button
              key={choice}
              className={`rps-button ${
                selectedChoice === choice ? "selected" : ""
              }`}
              onClick={() => setSelectedChoice(choice)}
            >
              <span className="rps-emoji">{getEmoji(choice)}</span>
              <span className="rps-name">{choice}</span>
            </button>
          ))}
        </div>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!selectedChoice}
        >
          Submit Choice
        </button>
      </div>
    </div>
  );
};