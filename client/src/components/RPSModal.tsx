import React, { useState } from "react";
import { RPSChoice } from "../types/game.types";
import { useGameStore } from "../store/gameStore";

export const RPSModal: React.FC = () => {
  const { showRPSModal, submitRPS, rpsResult, setRPSResult } = useGameStore();
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
      case "ROCK": return "🪨";
      case "PAPER": return "📄";
      case "SCISSORS": return "✂️";
    }
  };

  if (rpsResult) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl shadow-cyan-500/20 border-2 border-slate-700 max-w-md w-full p-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-6 text-center">
            RPS Result
          </h2>
          
          <div className="flex items-center justify-around mb-6">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-sm text-slate-400 font-semibold">Player X</span>
              <span className="text-6xl">{getEmoji(rpsResult.xChoice)}</span>
              <span className="text-sm text-cyan-400 font-bold">{rpsResult.xChoice}</span>
            </div>
            
            <div className="text-3xl font-bold text-slate-600">VS</div>
            
            <div className="flex flex-col items-center space-y-2">
              <span className="text-sm text-slate-400 font-semibold">Player O</span>
              <span className="text-6xl">{getEmoji(rpsResult.oChoice)}</span>
              <span className="text-sm text-blue-400 font-bold">{rpsResult.oChoice}</span>
            </div>
          </div>
          
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center mb-6">
            <p className="text-slate-300 font-semibold">
              {rpsResult.winner === "DRAW" 
                ? "It's a draw! Both players get 1 move." 
                : `Player ${rpsResult.winner === "X_WINS" ? "X" : "O"} wins! They get 1 move.`}
            </p>
          </div>
          
          <button
            onClick={() => setRPSResult(null)}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/30"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl shadow-cyan-500/20 border-2 border-slate-700 max-w-md w-full p-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2 text-center">
          Choose Your Move
        </h2>
        <p className="text-slate-400 text-center mb-6">Rock, Paper, Scissors!</p>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          {choices.map((choice) => (
            <button
              key={choice}
              onClick={() => setSelectedChoice(choice)}
              className={`flex flex-col items-center space-y-2 p-4 rounded-xl border-2 transition-all ${
                selectedChoice === choice
                  ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400 shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span className="text-5xl">{getEmoji(choice)}</span>
              <span className="text-sm font-bold text-slate-300">{choice}</span>
            </button>
          ))}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!selectedChoice}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/30 disabled:shadow-none"
        >
          Submit Choice
        </button>
      </div>
    </div>
  );
};