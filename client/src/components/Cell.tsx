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

  return (
    <button
      className={`cell ${state.toLowerCase()} ${
        disabled || state !== "EMPTY" ? "disabled" : ""
      } ${isLastMove ? "last-move" : ""}`}
      onClick={handleClick}
      disabled={disabled || state !== "EMPTY"}
    >
      {state !== "EMPTY" && <span className="cell-mark">{state}</span>}
    </button>
  );
};