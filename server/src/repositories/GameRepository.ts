import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { GameState, Player, Position, CellState, MicroboardState } from '../engine/types';

export class GameRepository {
  
  // Create a new game
  async createGame(gameId: string): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert game
      await connection.query(
        'INSERT INTO games (id, current_player, phase, rps_round, moves_made) VALUES (?, ?, ?, ?, ?)',
        [gameId, 'X', 'RPS', JSON.stringify({ movesAllowed: { X: 0, O: 0 } }), JSON.stringify({ X: 0, O: 0 })]
      );

      // Insert 9 microboards
      const microboardPromises = [];
      for (let i = 0; i < 9; i++) {
        const cells = Array(9).fill('EMPTY');
        microboardPromises.push(
          connection.query(
            'INSERT INTO microboards (game_id, board_index, state, cells) VALUES (?, ?, ?, ?)',
            [gameId, i, 'IN_PROGRESS', JSON.stringify(cells)]
          )
        );
      }
      await Promise.all(microboardPromises);

      // Insert macroboard
      const squares = Array(9).fill('IN_PROGRESS');
      await connection.query(
        'INSERT INTO macroboard (game_id, squares, state) VALUES (?, ?, ?)',
        [gameId, JSON.stringify(squares), 'IN_PROGRESS']
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Assign player to socket
  async assignPlayer(gameId: string, socketId: string, userId?: string): Promise<Player> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check if this socket already has a player assigned (reconnection case)
      const [existingSocket] = await connection.query<RowDataPacket[]>(
        'SELECT player FROM game_players WHERE game_id = ? AND socket_id = ? FOR UPDATE',
        [gameId, socketId]
      );

      if (existingSocket.length > 0) {
        // Socket already assigned, return existing player
        await connection.query(
          'UPDATE game_players SET last_seen = CURRENT_TIMESTAMP WHERE game_id = ? AND socket_id = ?',
          [gameId, socketId]
        );
        await connection.commit();
        console.log(`Socket ${socketId} reconnected as player ${existingSocket[0].player} in game ${gameId}`);
        return existingSocket[0].player as Player;
      }

      // Lock the rows and check which players are already taken
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT player FROM game_players WHERE game_id = ? FOR UPDATE',
        [gameId]
      );

      const takenPlayers = new Set(rows.map(r => r.player as Player));
      
      console.log(`Game ${gameId}: Taken players:`, Array.from(takenPlayers));

      // Assign the first available player
      let player: Player;
      if (!takenPlayers.has('X')) {
        player = 'X';
      } else if (!takenPlayers.has('O')) {
        player = 'O';
      } else {
        await connection.rollback();
        throw new Error('Game is full - both players already assigned');
      }

      // Insert new player assignment
      await connection.query(
        'INSERT INTO game_players (game_id, player, socket_id, user_id) VALUES (?, ?, ?, ?)',
        [gameId, player, socketId, userId || null]
      );

      await connection.commit();
      console.log(`Socket ${socketId} assigned as player ${player} in game ${gameId}`);
      
      return player;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get player by socket
  async getPlayerBySocket(gameId: string, socketId: string): Promise<Player | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT player FROM game_players WHERE game_id = ? AND socket_id = ?',
      [gameId, socketId]
    );
    return rows.length > 0 ? (rows[0].player as Player) : null;
  }

  // Update socket ID (for reconnection)
  async updateSocketId(gameId: string, oldSocketId: string, newSocketId: string): Promise<void> {
    await pool.query(
      'UPDATE game_players SET socket_id = ?, last_seen = CURRENT_TIMESTAMP WHERE game_id = ? AND socket_id = ?',
      [newSocketId, gameId, oldSocketId]
    );
  }

  // Load full game state
  async loadGameState(gameId: string): Promise<GameState | null> {
    const connection = await pool.getConnection();
    try {
      // Get game
      const [gameRows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM games WHERE id = ?',
        [gameId]
      );

      if (gameRows.length === 0) return null;
      const game = gameRows[0];

      // Get microboards
      const [microboardRows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM microboards WHERE game_id = ? ORDER BY board_index',
        [gameId]
      );

      // Get macroboard
      const [macroboardRows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM macroboard WHERE game_id = ?',
        [gameId]
      );

      // Get move history
      const [historyRows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM move_history WHERE game_id = ? ORDER BY move_number',
        [gameId]
      );

      const board = microboardRows.map(mb => JSON.parse(mb.cells) as CellState[]);
      const microboards = microboardRows.map(mb => mb.state as MicroboardState);
      const macroboard = macroboardRows[0];
      const history = historyRows.map(h => ({
        player: h.player as Player,
        position: { microboard: h.microboard, cell: h.cell }
      }));

      return {
        id: game.id,
        board,
        microboards,
        macroboard: macroboard.state as MicroboardState,
        currentPlayer: game.current_player as Player,
        phase: game.phase as 'RPS' | 'MOVE',
        rpsRound: JSON.parse(game.rps_round),
        movesMade: JSON.parse(game.moves_made),
        winner: game.winner || undefined,
        history,
        createdAt: game.created_at
      };
    } finally {
      connection.release();
    }
  }

  // Save game state
  async saveGameState(gameState: GameState): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update game
      await connection.query(
        `UPDATE games SET 
          current_player = ?, 
          phase = ?, 
          rps_round = ?, 
          moves_made = ?, 
          macroboard_state = ?,
          winner = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          gameState.currentPlayer,
          gameState.phase,
          JSON.stringify(gameState.rpsRound),
          JSON.stringify(gameState.movesMade),
          gameState.macroboard,
          gameState.winner || null,
          gameState.id
        ]
      );

      // Update microboards
      for (let i = 0; i < 9; i++) {
        await connection.query(
          'UPDATE microboards SET state = ?, cells = ? WHERE game_id = ? AND board_index = ?',
          [gameState.microboards[i], JSON.stringify(gameState.board[i]), gameState.id, i]
        );
      }

      // Update macroboard
      await connection.query(
        'UPDATE macroboard SET squares = ?, state = ? WHERE game_id = ?',
        [JSON.stringify(gameState.microboards), gameState.macroboard, gameState.id]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Add move to history
  async addMoveToHistory(gameId: string, player: Player, position: Position, moveNumber: number): Promise<void> {
    await pool.query(
      'INSERT INTO move_history (game_id, player, microboard, cell, move_number) VALUES (?, ?, ?, ?, ?)',
      [gameId, player, position.microboard, position.cell, moveNumber]
    );
  }

  // Get all active games
  async getActiveGames(): Promise<GameState[]> {
    const [games] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM games WHERE winner IS NULL ORDER BY created_at DESC LIMIT 100'
    );
    
    const gameStates = await Promise.all(
      games.map(g => this.loadGameState(g.id))
    );
    
    return gameStates.filter(g => g !== null) as GameState[];
  }

  // Delete old games (cleanup)
  async deleteOldGames(daysOld: number = 7): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM games WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [daysOld]
    );
    return result.affectedRows;
  }
}