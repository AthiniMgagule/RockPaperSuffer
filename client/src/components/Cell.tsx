import React from "react";
import { CellState, Position } from "../types/game.types";

interface CellProps {
  state: CellState;
  position: Position;
  onClick: (position: Position) => void;
  disabled: boolean;
  isLastMove: boolean;
}

export const Cell: React.FC<CellProps> = ({
  state,
  position,
  onClick,
  disabled,
  isLastMove,
}) => {
  const handleClick = () => {
    if (!disabled && state === "EMPTY") {
      onClick(position);
    }
  };

  const getCellClass = () => {
    let classes = "aspect-square flex items-center justify-center rounded-lg border-2 font-black text-2xl transition-all ";
    
    if (state === "EMPTY") {
      if (disabled) {
        classes += "bg-slate-900/50 border-slate-700 cursor-not-allowed";
      } else {
        classes += "bg-slate-900/50 border-slate-700 hover:border-cyan-400 hover:bg-slate-800 hover:scale-110 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/30";
      }
    } else if (state === "X") {
      classes += "bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-cyan-400 text-cyan-400";
    } else if (state === "O") {
      classes += "bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400 text-blue-400";
    }

    if (isLastMove) {
      classes += " ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-800 animate-pulse";
    }

    return classes;
  };

  return (
    <button
      className={getCellClass()}
      onClick={handleClick}
      disabled={disabled || state !== "EMPTY"}
    >
      {state !== "EMPTY" && <span>{state}</span>}
    </button>
  );
};