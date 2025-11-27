import React from "react";
import { MicroboardState } from "../types/game.types";

interface MacroBoardProps {
  microboards: MicroboardState[];
}

export const MacroBoard: React.FC<MacroBoardProps> = ({ microboards }) => {
  const renderSquare = (state: MicroboardState) => {
    if (state === "WON_X") return "X";
    if (state === "WON_O") return "O";
    if (state === "DRAW") return "·";
    return "";
  };

  const getSquareClass = (state: MicroboardState) => {
    if (state === "WON_X") return "bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 border-cyan-400 text-cyan-300";
    if (state === "WON_O") return "bg-gradient-to-br from-blue-500/30 to-blue-600/30 border-blue-400 text-blue-300";
    if (state === "DRAW") return "bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 border-yellow-400 text-yellow-300";
    return "bg-slate-800/50 border-slate-700 text-slate-600";
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 rounded-2xl shadow-xl border-2 border-slate-700 p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4 text-center">
        Macroboard Status
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {microboards.map((state, index) => (
          <div 
            key={index} 
            className={`aspect-square flex items-center justify-center text-3xl font-bold rounded-lg border-2 transition-all ${getSquareClass(state)}`}
          >
            {renderSquare(state)}
          </div>
        ))}
      </div>
    </div>
  );
};