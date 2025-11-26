// src/App.tsx
import React, { useEffect, useState } from "react";
import { GameBoard } from "./components/GameBoard";
import { MacroBoard } from "./components/MacroBoard";
import { RPSModal } from "./components/RPSModal";
import { GameStatus } from "./components/GameStatus";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useGameStore } from "./store/gameStore";
import { useAuthStore } from "./store/authStore";
import {
  gameApi,
  socket,
  setupSocketListeners,
  cleanupSocketListeners,
  authenticateSocket,
  joinGameWithAuth,
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

  const { checkAuth, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check authentication on mount
    checkAuth();

    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
      
      // Authenticate socket if user is logged in
      if (isAuthenticated) {
        authenticateSocket();
      }
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
      },
      (data) => {
        // Handle player assignment from server
        console.log("Assigned as player:", data.player);
        setLocalPlayer(data.player);
      }
    );

    return () => {
      cleanupSocketListeners();
      socket.disconnect();
    };
  }, []);

  // Re-authenticate socket when user logs in
  useEffect(() => {
    if (isAuthenticated && isConnected) {
      authenticateSocket();
    }
  }, [isAuthenticated, isConnected]);

  const handleCreateGame = async () => {
    try {
      const newGame = await gameApi.createGame();
      setGameState(newGame);
      joinGameWithAuth(newGame.id);
      setShowRPSModal(true);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      const game = await gameApi.getGame(gameId);
      setGameState(game);
      joinGameWithAuth(game.id);
      // Don't set localPlayer here - wait for server assignment
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
        <Header />
        
        <div className="app-main">
          <div className="welcome-screen">
            <h1>Rock Paper Suffer</h1>
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
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      
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
      
      <Footer />
    </div>
  );
}

export default App;