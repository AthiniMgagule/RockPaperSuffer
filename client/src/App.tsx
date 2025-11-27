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
  const [gameIdInput, setGameIdInput] = useState("");

  useEffect(() => {
    checkAuth();
    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
      
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
        console.log("Assigned as player:", data.player);
        setLocalPlayer(data.player);
      }
    );

    return () => {
      cleanupSocketListeners();
      socket.disconnect();
    };
  }, []);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
        <Header />
        
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
                Rock Paper Suffer
              </h1>
              <p className="text-2xl text-slate-400">
                Rock Paper Scissors meets Ultimate Tic Tac Toe
              </p>

              <div className="mt-6 inline-flex items-center space-x-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700 backdrop-blur-sm">
                {isConnected ? (
                  <>
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-400/50"></span>
                    <span className="text-cyan-400 font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
                    <span className="text-slate-500 font-medium">Disconnected</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 rounded-2xl shadow-2xl shadow-cyan-500/10 border-2 border-slate-700 p-8 mb-8 backdrop-blur-sm">
              <button 
                onClick={handleCreateGame}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-xl font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/30 mb-6"
              >
                Create New Game
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-800/90 text-slate-400">Or join an existing game</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <input
                  type="text"
                  value={gameIdInput}
                  onChange={(e) => setGameIdInput(e.target.value)}
                  placeholder="Enter Game ID"
                  className="w-full px-4 py-3 bg-slate-800/50 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all backdrop-blur-sm"
                />
                <button 
                  onClick={() => gameIdInput && handleJoinGame(gameIdInput)}
                  className="w-full py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-lg transition-colors border border-slate-600 backdrop-blur-sm"
                >
                  Join Game
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 rounded-2xl shadow-xl border-2 border-slate-700 p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">How to Play</h3>
              <ol className="space-y-3 text-slate-300">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-cyan-500/30">1</span>
                  <span>Each turn starts with Rock-Paper-Scissors</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-cyan-500/30">2</span>
                  <span>Winner gets 1 move, draw means both get 1 move</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-cyan-500/30">3</span>
                  <span>Make moves on any unresolved 3×3 microboard</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-cyan-500/30">4</span>
                  <span>Win 3 microboards in a row to win the game!</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-[1600px] mx-auto w-full">
        <div className="lg:w-80 flex flex-col gap-6">
          <GameStatus />
          <MacroBoard microboards={gameState.microboards} />
          <button 
            onClick={handleReset}
            className="w-full py-3 bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium rounded-lg transition-colors border border-slate-600 backdrop-blur-sm"
          >
            New Game
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <GameBoard />
        </div>
      </div>

      <RPSModal />
      <Footer />
    </div>
  );
}

export default App;