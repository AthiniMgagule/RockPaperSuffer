import { v4 as uuidv4 } from "uuid";
import { Microboard } from "./Microboard";
import { Macroboard } from "./Macroboard";
import { RPS } from "./RPS";
import { MoveValidator } from "./MoveValidator";
import {
  GameState,
  Player,
  RPSChoice,
  Position,
  Move,
  RPSRound,
} from "./types";

export class GameEngine {
  private id: string;
  private microboards: Microboard[] = [];
  private macroboard: Macroboard;
  private currentPlayer: Player = "X";
  private phase: "RPS" | "MOVE" = "RPS";
  private rpsRound: RPSRound = {
    movesAllowed: { X: 0, O: 0 },
  };
  private movesMade: { X: number; O: number } = { X: 0, O: 0 };
  private history: Move[] = [];
  private createdAt: Date;

  constructor(id?: string) {
    this.id = id || uuidv4();
    this.createdAt = new Date();
    this.macroboard = new Macroboard();

    for (let i = 0; i < 9; i++) {
      this.microboards.push(new Microboard());
    }
  }

  getId(): string {
    return this.id;
  }

  getState(): GameState {
    return {
      id: this.id,
      board: this.microboards.map((mb) => mb.getCells()),
      microboards: this.microboards.map((mb) => mb.getState()),
      macroboard: this.macroboard.getState(),
      currentPlayer: this.currentPlayer,
      phase: this.phase,
      rpsRound: { ...this.rpsRound },
      movesMade: { ...this.movesMade },
      winner: this.macroboard.getWinner() || undefined,
      history: [...this.history],
      createdAt: this.createdAt,
    };
  }

  submitRPS(player: Player, choice: RPSChoice): { 
    waiting: boolean; 
    result?: { 
      xChoice: RPSChoice; 
      oChoice: RPSChoice; 
      winner: string;
      movesAllowed: { X: number; O: number };
    } 
  } {
    if (this.phase !== "RPS") {
      throw new Error("Not in RPS phase");
    }

    if (player === "X") {
      this.rpsRound.xChoice = choice;
    } else {
      this.rpsRound.oChoice = choice;
    }

    // Check if both players have chosen
    if (this.rpsRound.xChoice && this.rpsRound.oChoice) {
      const result = RPS.determineWinner(
        this.rpsRound.xChoice,
        this.rpsRound.oChoice
      );
      const movesAllowed = RPS.getMovesAllowed(result);

      this.rpsRound.result = result;
      this.rpsRound.movesAllowed = movesAllowed;
      this.phase = "MOVE";
      this.movesMade = { X: 0, O: 0 };

      return {
        waiting: false,
        result: {
          xChoice: this.rpsRound.xChoice,
          oChoice: this.rpsRound.oChoice,
          winner: result,
          movesAllowed,
        },
      };
    }

    return { waiting: true };
  }

  makeMove(player: Player, position: Position): void {
    if (this.phase !== "MOVE") {
      throw new Error("Not in MOVE phase");
    }

    if (this.macroboard.getWinner()) {
      throw new Error("Game is already over");
    }

    const validation = MoveValidator.validateMove(
      this.microboards,
      position,
      player,
      this.movesMade,
      this.rpsRound.movesAllowed
    );

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Make the move
    this.microboards[position.microboard].makeMove(position.cell, player);
    this.movesMade[player]++;

    // Record history
    this.history.push({ player, position });

    // Update macroboard
    const microboardState = this.microboards[position.microboard].getState();
    this.macroboard.updateSquare(position.microboard, microboardState);

    // Check if all moves are made
    const totalMovesMade = this.movesMade.X + this.movesMade.O;
    const totalMovesAllowed =
      this.rpsRound.movesAllowed.X + this.rpsRound.movesAllowed.O;

    if (totalMovesMade >= totalMovesAllowed) {
      // Start new RPS round
      this.phase = "RPS";
      this.rpsRound = {
        movesAllowed: { X: 0, O: 0 },
      };
      this.movesMade = { X: 0, O: 0 };
      this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
    }
  }

  isGameOver(): boolean {
    return this.macroboard.getWinner() !== null;
  }

  getWinner(): Player | "DRAW" | null {
    return this.macroboard.getWinner();
  }
}