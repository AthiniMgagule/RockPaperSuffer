import React, { useEffect, useState } from "react";
import { GameBoard } from "./components/GameBoard";
import { MacroBoard } from "./components/MacroBoard";
import { RPSModal } from "./components/RPSModal";
import { GameStatus } from "./components/GameStatus";
import { useGameStore } from "./store/gameStore";
import {
  gameApi,
  socket,
  setupSocketListeners,
  cleanupSocketListeners,
} from "./services/api";
import "./styles/game.css";

function App() {
  const {
    gameState,
    setGameState,
    setShowRPSModal,
    setRPSResult,
    setError,
    setLastMove,
    localPlayer,
    setLocalPlayer,
    reset,
  } = useGameStore();

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    setupSocketListeners(
      (state) => {
        setGameState(state);
        if (state.phase === "RPS" && !state.rpsRound.xChoice && !state.rpsRound.oChoice) {
          setShowRPSModal(true);
        }
      },
      (result) => {
        setRPSResult(result);
      },
      () => {
        console.log("Waiting for other player's RPS choice...");
      },
      (data) => {
        setLastMove(data.position);
      },
      (data) => {
        console.log("Game ended:", data.winner);
      },
      (error) => {
        setError(error.message);
      }
    );

    return () => {
      cleanupSocketListeners();
      socket.disconnect();
    };
  }, []);

  const handleCreateGame = async () => {
    try {
      const newGame = await gameApi.createGame();
      setGameState(newGame);
      socket.emit("join:game", newGame.id);
      setShowRPSModal(true);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      const game = await gameApi.getGame(gameId);
      setGameState(game);
      socket.emit("join:game", game.id);
      setLocalPlayer("O");
      if (game.phase === "RPS") {
        setShowRPSModal(true);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleReset = () => {
    reset();
  };

  if (!gameState) {
    return (
      <div className="app">
        <div className="welcome-screen">
          <h1>RPS × Ultimate Tic Tac Toe</h1>
          <p className="subtitle">
            Rock Paper Scissors meets Ultimate Tic Tac Toe
          </p>

          <div className="connection-status">
            {isConnected ? (
              <span className="connected">✓ Connected</span>
            ) : (
              <span className="disconnected">✗ Disconnected</span>
            )}
          </div>

          <div className="welcome-actions">
            <button className="btn-primary large" onClick={handleCreateGame}>
              Create New Game
            </button>

            <div className="join-section">
              <p>Or join an existing game:</p>
              <input
                type="text"
                placeholder="Enter Game ID"
                id="gameIdInput"
                className="game-id-input"
              />
              <button
                className="btn-secondary"
                onClick={() => {
                  const input = document.getElementById(
                    "gameIdInput"
                  ) as HTMLInputElement;
                  if (input.value) {
                    handleJoinGame(input.value);
                  }
                }}
              >
                Join Game
              </button>
            </div>
          </div>

          <div className="rules-section">
            <h3>How to Play</h3>
            <ol>
              <li>Each turn starts with Rock-Paper-Scissors</li>
              <li>Winner gets 1 move, draw means both get 1 move</li>
              <li>Make moves on any unresolved 3×3 microboard</li>
              <li>Win 3 microboards in a row to win the game!</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="game-container">
        <div className="left-panel">
          <GameStatus />
          <MacroBoard microboards={gameState.microboards} />
          <button className="btn-secondary" onClick={handleReset}>
            New Game
          </button>
        </div>

        <div className="main-panel">
          <GameBoard />
        </div>
      </div>

      <RPSModal />
    </div>
  );
}

export default App;