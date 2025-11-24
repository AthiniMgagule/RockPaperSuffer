import { Microboard } from "./Microboard";
import { Player, Position } from "./types";

export class MoveValidator {
  static validateMove(
    microboards: Microboard[],
    position: Position,
    player: Player,
    movesMade: { X: number; O: number },
    movesAllowed: { X: number; O: number }
  ): { valid: boolean; error?: string } {
    // Check if player has moves remaining
    if (movesMade[player] >= movesAllowed[player]) {
      return { valid: false, error: "No moves remaining this turn" };
    }

    // Validate position bounds
    if (
      position.microboard < 0 ||
      position.microboard >= 9 ||
      position.cell < 0 ||
      position.cell >= 9
    ) {
      return { valid: false, error: "Invalid position" };
    }

    // Check if microboard is resolved
    const microboard = microboards[position.microboard];
    if (microboard.isResolved()) {
      return { valid: false, error: "Microboard is already resolved" };
    }

    // Check if cell is empty
    const cell = microboard.getCell(position.cell);
    if (!cell.isEmpty()) {
      return { valid: false, error: "Cell is already occupied" };
    }

    return { valid: true };
  }
}