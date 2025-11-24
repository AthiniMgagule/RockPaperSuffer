import { Cell } from "./Cell";
import { CellState, MicroboardState, Player } from "./types";

export class Microboard {
  private cells: Cell[] = [];
  private state: MicroboardState = "IN_PROGRESS";

  constructor() {
    for (let i = 0; i < 9; i++) {
      this.cells.push(new Cell());
    }
  }

  getCell(index: number): Cell {
    if (index < 0 || index >= 9) {
      throw new Error("Invalid cell index");
    }
    return this.cells[index];
  }

  getCells(): CellState[] {
    return this.cells.map((cell) => cell.getState());
  }

  getState(): MicroboardState {
    return this.state;
  }

  isResolved(): boolean {
    return this.state !== "IN_PROGRESS";
  }

  makeMove(cellIndex: number, player: Player): void {
    if (this.isResolved()) {
      throw new Error("Microboard is already resolved");
    }
    
    this.cells[cellIndex].mark(player);
    this.updateState();
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
    const cells = this.getCells();
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6], // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (
        cells[a] !== "EMPTY" &&
        cells[a] === cells[b] &&
        cells[a] === cells[c]
      ) {
        return cells[a] as Player;
      }
    }

    return null;
  }

  private isFull(): boolean {
    return this.cells.every((cell) => !cell.isEmpty());
  }
}