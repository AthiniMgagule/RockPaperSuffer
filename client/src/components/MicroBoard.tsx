import React from "react";
import { Cell } from "./Cell";
import { CellState, MicroboardState, Position } from "../types/game.types";

interface MicroBoardProps {
  cells: CellState[];
  microboardIndex: number;
  state: MicroboardState;
  onCellClick: (position: Position) => void;
  disabled: boolean;
  lastMove: Position | null;
}

export const MicroBoard: React.FC<MicroBoardProps> = ({
  cells,
  microboardIndex,
  state,
  onCellClick,
  disabled,
  lastMove,
}) => {
  const getWinnerOverlay = () => {
    if (state === "WON_X") {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/20 rounded-xl border-2 border-cyan-400/50 pointer-events-none">
          <span className="text-8xl font-black text-cyan-400 drop-shadow-lg">X</span>
        </div>
      );
    }
    if (state === "WON_O") {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 rounded-xl border-2 border-blue-400/50 pointer-events-none">
          <span className="text-8xl font-black text-blue-400 drop-shadow-lg">O</span>
        </div>
      );
    }
    if (state === "DRAW") {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/20 rounded-xl border-2 border-yellow-400/50 pointer-events-none">
          <span className="text-5xl font-black text-yellow-400 drop-shadow-lg">Draw</span>
        </div>
      );
    }
    return null;
  };

  const getMicroboardClass = () => {
    if (state !== "IN_PROGRESS") return "opacity-60";
    return "hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20";
  };

  return (
    <div className={`relative bg-slate-800/50 rounded-xl border-2 border-slate-700 p-2 transition-all ${getMicroboardClass()}`}>
      <div className="grid grid-cols-3 gap-1.5">
        {cells.map((cellState, cellIndex) => {
          const isLastMove =
            lastMove?.microboard === microboardIndex &&
            lastMove?.cell === cellIndex;

          return (
            <Cell
              key={cellIndex}
              state={cellState}
              position={{ microboard: microboardIndex, cell: cellIndex }}
              onClick={onCellClick}
              disabled={disabled || state !== "IN_PROGRESS"}
              isLastMove={isLastMove}
            />
          );
        })}
      </div>
      {getWinnerOverlay()}
    </div>
  );
};
