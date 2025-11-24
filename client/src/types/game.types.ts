export type CellState = "EMPTY" | "X" | "O";
export type MicroboardState = "IN_PROGRESS" | "WON_X" | "WON_O" | "DRAW";
export type MacroboardState = MicroboardState;
export type Player = "X" | "O";
export type RPSChoice = "ROCK" | "PAPER" | "SCISSORS";

export interface Position {
  microboard: number;
  cell: number;
}

export interface GameState {
  id: string;
  board: CellState[][];
  microboards: MicroboardState[];
  macroboard: MacroboardState;
  currentPlayer: Player;
  phase: "RPS" | "MOVE";
  rpsRound: {
    xChoice?: RPSChoice;
    oChoice?: RPSChoice;
    result?: string;
    movesAllowed: {
      X: number;
      O: number;
    };
  };
  movesMade: { X: number; O: number };
  winner?: Player | "DRAW";
  history: Array<{ player: Player; position: Position }>;
}

export interface RPSResult {
  xChoice: RPSChoice;
  oChoice: RPSChoice;
  winner: string;
  movesAllowed: { X: number; O: number };
}