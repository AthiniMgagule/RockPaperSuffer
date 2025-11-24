import { GameEngine } from "../engine/GameEngine";
import { GameRepository } from "../repositories/GameRepository";
import { Player, RPSChoice, Position, GameState } from "../engine/types";

export class GameService {
  private games: Map<string, GameEngine> = new Map();
  private repository: GameRepository;

  constructor() {
    this.repository = new GameRepository();
  }

  async createGame(): Promise<GameEngine> {
    const game = new GameEngine();
    const gameId = game.getId();
    
    // Save to database
    await this.repository.createGame(gameId);
    
    // Cache in memory
    this.games.set(gameId, game);
    
    return game;
  }

  async getGame(gameId: string): Promise<GameEngine | undefined> {
    // Check cache first
    if (this.games.has(gameId)) {
      return this.games.get(gameId);
    }

    // Load from database
    const gameState = await this.repository.loadGameState(gameId);
    if (!gameState) return undefined;

    // Reconstruct game engine from state
    const game = new GameEngine(gameId);
    // Load the state into the game (you'll need to add a method to GameEngine)
    // For now, cache it
    this.games.set(gameId, game);
    
    return game;
  }

  async assignPlayerToSocket(gameId: string, socketId: string): Promise<Player> {
    return await this.repository.assignPlayer(gameId, socketId);
  }

  async getPlayerBySocket(gameId: string, socketId: string): Promise<Player | null> {
    return await this.repository.getPlayerBySocket(gameId, socketId);
  }

  async submitRPS(gameId: string, player: Player, choice: RPSChoice) {
    const game = await this.getGame(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    
    const result = game.submitRPS(player, choice);
    
    // Save state to database
    await this.repository.saveGameState(game.getState());
    
    return result;
  }

  async makeMove(gameId: string, player: Player, position: Position): Promise<GameState> {
    const game = await this.getGame(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    
    game.makeMove(player, position);
    const gameState = game.getState();
    
    // Save to database
    await this.repository.saveGameState(gameState);
    await this.repository.addMoveToHistory(
      gameId,
      player,
      position,
      gameState.history.length
    );
    
    return gameState;
  }

  async getGameState(gameId: string): Promise<GameState | null> {
    // Try cache first
    const game = this.games.get(gameId);
    if (game) {
      return game.getState();
    }

    // Load from database
    return await this.repository.loadGameState(gameId);
  }

  async deleteGame(gameId: string): Promise<boolean> {
    this.games.delete(gameId);
    // Database cascades will handle deletion
    return true;
  }

  async getAllGames(): Promise<GameState[]> {
    return await this.repository.getActiveGames();
  }

  
}