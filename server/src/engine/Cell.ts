import { CellState, Player } from "./types";

export class Cell {
  private state: CellState = "EMPTY";

  getState(): CellState {
    return this.state;
  }

  isEmpty(): boolean {
    return this.state === "EMPTY";
  }

  mark(player: Player): void {
    if (!this.isEmpty()) {
      throw new Error("Cell is already marked");
    }
    this.state = player;
  }

  reset(): void {
    this.state = "EMPTY";
  }
}