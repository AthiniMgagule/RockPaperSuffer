export type CellState = "EMPTY" | "X" | "O";
export type MicroboardState = "IN_PROGRESS" | "WON_X" | "WON_O" | "DRAW";
export type MacroboardState = MicroboardState;
export type Player = "X" | "O";
export type RPSChoice = "ROCK" | "PAPER" | "SCISSORS";
export type RPSResult = "X_WINS" | "O_WINS" | "DRAW";

export interface Position {
  microboard: number;
  cell: number;
}

export interface Move {
  player: Player;
  position: Position;
}

export interface RPSRound {
  xChoice?: RPSChoice;
  oChoice?: RPSChoice;
  result?: RPSResult;
  movesAllowed: {
    X: number;
    O: number;
  };
}

export interface GameState {
  id: string;
  board: CellState[][];
  microboards: MicroboardState[];
  macroboard: MacroboardState;
  currentPlayer: Player;
  phase: "RPS" | "MOVE";
  rpsRound: RPSRound;
  movesMade: { X: number; O: number };
  winner?: Player | "DRAW";
  history: Move[];
  createdAt: Date;
}