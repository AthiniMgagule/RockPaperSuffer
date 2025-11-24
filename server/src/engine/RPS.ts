import { RPSChoice, RPSResult } from "./types";

export class RPS {
  static determineWinner(xChoice: RPSChoice, oChoice: RPSChoice): RPSResult {
    if (xChoice === oChoice) {
      return "DRAW";
    }

    const winConditions: Record<RPSChoice, RPSChoice> = {
      ROCK: "SCISSORS",
      PAPER: "ROCK",
      SCISSORS: "PAPER",
    };

    return winConditions[xChoice] === oChoice ? "X_WINS" : "O_WINS";
  }

  static getMovesAllowed(result: RPSResult): { X: number; O: number } {
    switch (result) {
      case "X_WINS":
        return { X: 1, O: 0 };
      case "O_WINS":
        return { X: 0, O: 1 };
      case "DRAW":
        return { X: 1, O: 1 };
    }
  }

  static isValidChoice(choice: string): choice is RPSChoice {
    return ["ROCK", "PAPER", "SCISSORS"].includes(choice);
  }
}