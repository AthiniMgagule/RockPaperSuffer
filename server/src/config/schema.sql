-- Create database
CREATE DATABASE IF NOT EXISTS rps_game;
USE rps_game;

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(36) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  current_player ENUM('X', 'O') NOT NULL DEFAULT 'X',
  phase ENUM('RPS', 'MOVE') NOT NULL DEFAULT 'RPS',
  rps_round JSON,
  moves_made JSON,
  macroboard_state VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
  winner ENUM('X', 'O', 'DRAW') NULL,
  INDEX idx_created_at (created_at)
);

-- Players table - tracks which socket/user is which player
CREATE TABLE IF NOT EXISTS game_players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id VARCHAR(36) NOT NULL,
  player ENUM('X', 'O') NOT NULL,
  socket_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(100) NULL, -- For future authentication
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  UNIQUE KEY unique_game_player (game_id, player),
  INDEX idx_socket (socket_id),
  INDEX idx_game (game_id)
);

-- Microboards table
CREATE TABLE IF NOT EXISTS microboards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id VARCHAR(36) NOT NULL,
  board_index TINYINT NOT NULL,
  state ENUM('IN_PROGRESS', 'WON_X', 'WON_O', 'DRAW') NOT NULL DEFAULT 'IN_PROGRESS',
  cells JSON NOT NULL, -- Array of 9 cell states
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  UNIQUE KEY unique_game_board (game_id, board_index),
  INDEX idx_game (game_id)
);

-- Move history table
CREATE TABLE IF NOT EXISTS move_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id VARCHAR(36) NOT NULL,
  player ENUM('X', 'O') NOT NULL,
  microboard TINYINT NOT NULL,
  cell TINYINT NOT NULL,
  move_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  INDEX idx_game (game_id),
  INDEX idx_created_at (created_at)
);

-- Macroboard table
CREATE TABLE IF NOT EXISTS macroboard (
  game_id VARCHAR(36) PRIMARY KEY,
  squares JSON NOT NULL, -- Array of 9 microboard states
  state VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);