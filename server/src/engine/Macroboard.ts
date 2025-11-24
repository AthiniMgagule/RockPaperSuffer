import { MacroboardState, MicroboardState, Player } from "./types";

export class Macroboard {
  private squares: MicroboardState[] = Array(9).fill("IN_PROGRESS");
  private state: MacroboardState = "IN_PROGRESS";

  updateSquare(index: number, microboardState: MicroboardState): void {
    this.squares[index] = microboardState;
    this.updateState();
  }

  getSquares(): MicroboardState[] {
    return [...this.squares];
  }

  getState(): MacroboardState {
    return this.state;
  }

  getWinner(): Player | "DRAW" | null {
    if (this.state === "WON_X") return "X";
    if (this.state === "WON_O") return "O";
    if (this.state === "DRAW") return "DRAW";
    return null;
  }

  private updateState(): void {
    const winner = this.checkWinner();
    if (winner) {
      this.state = winner === "X" ? "WON_X" : "WON_O";
    } else if (this.isFull()) {
      this.state = "DRAW";
    }
  }

  private checkWinner(): Player | null {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6], // diagonals
    ];

    for (const [a, b, c] of lines) {
      const stateA = this.squares[a];
      const stateB = this.squares[b];
      const stateC = this.squares[c];

      if (
        (stateA === "WON_X" || stateA === "WON_O") &&
        stateA === stateB &&
        stateA === stateC
      ) {
        return stateA === "WON_X" ? "X" : "O";
      }
    }

    return null;
  }

  private isFull(): boolean {
    return this.squares.every((square) => square !== "IN_PROGRESS");
  }
}