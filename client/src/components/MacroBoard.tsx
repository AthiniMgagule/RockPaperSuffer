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

  return (
    <div className="macroboard">
      <h3>Macroboard Status</h3>
      <div className="macroboard-grid">
        {microboards.map((state, index) => (
          <div key={index} className={`macro-square ${state.toLowerCase()}`}>
            {renderSquare(state)}
          </div>
        ))}
      </div>
    </div>
  );
};