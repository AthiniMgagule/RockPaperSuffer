import { Router } from "express";
import { GameService } from "../services/GameService";
import { RPS } from "../engine/RPS";

export function createGameRoutes(gameService: GameService): Router {
  const router = Router();

  // Create new game
  router.post("/new", async (req, res) => {
    try {
      const game = await gameService.createGame();
      res.json(game.getState());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get game state
  router.get("/:id", async (req, res) => {
    try {
      const gameState = await gameService.getGameState(req.params.id);
      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }
      res.json(gameState);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Submit RPS choice
  router.post("/:id/rps", async (req, res) => {
    try {
      const { player, choice } = req.body;

      if (!player || player !== "X" && player !== "O") {
        return res.status(400).json({ error: "Invalid player" });
      }

      if (!RPS.isValidChoice(choice)) {
        return res.status(400).json({ error: "Invalid RPS choice" });
      }

      const result = await gameService.submitRPS(req.params.id, player, choice);
      const gameState = await gameService.getGameState(req.params.id);

      res.json({ result, gameState });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Make a move
  router.post("/:id/move", async (req, res) => {
    try {
      const { player, position } = req.body;

      if (!player || player !== "X" && player !== "O") {
        return res.status(400).json({ error: "Invalid player" });
      }

      if (
        !position ||
        typeof position.microboard !== "number" ||
        typeof position.cell !== "number"
      ) {
        return res.status(400).json({ error: "Invalid position" });
      }

      const gameState = await gameService.makeMove(
        req.params.id,
        player,
        position
      );

      res.json(gameState);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // List all games (for debugging)
  router.get("/", async (req, res) => {
    try {
      const games = await gameService.getAllGames();
      res.json(games);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}