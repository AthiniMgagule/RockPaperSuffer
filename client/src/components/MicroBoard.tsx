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
    if (state === "WON_X") return <div className="winner-overlay">X</div>;
    if (state === "WON_O") return <div className="winner-overlay">O</div>;
    if (state === "DRAW") return <div className="winner-overlay draw">Draw</div>;
    return null;
  };

  return (
    <div className={`microboard ${state.toLowerCase()}`}>
      <div className="microboard-grid">
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