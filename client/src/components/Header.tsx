import React, { useState } from "react";
import { Swords, User, LogOut, Menu, X as XIcon } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { AuthModal } from "./AuthModal";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleSignIn = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b-2 border-cyan-400 shadow-lg shadow-cyan-400/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-lg shadow-lg shadow-cyan-400/50">
                <Swords className="w-8 h-8 text-white" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  Rock Paper Suffer
                </span>
                <span className="text-sm text-slate-400">May the Best Strategy Win</span>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
            >
              {isMenuOpen ? <XIcon size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors font-medium">Home</a>
              <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors font-medium">Games</a>
              <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors font-medium">Leaderboard</a>
              <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors font-medium">How to Play</a>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700 backdrop-blur-sm">
                    <User size={18} className="text-cyan-400" />
                    <span className="text-white">{user?.username}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors backdrop-blur-sm border border-slate-600"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={handleSignIn}
                    className="px-6 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors font-medium border border-slate-600 backdrop-blur-sm"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleSignUp}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/30"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </nav>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-slate-700">
              <a href="#" className="block text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2">Home</a>
              <a href="#" className="block text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2">Games</a>
              <a href="#" className="block text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2">Leaderboard</a>
              <a href="#" className="block text-slate-300 hover:text-cyan-400 transition-colors font-medium py-2">How to Play</a>
              
              {isAuthenticated ? (
                <div className="space-y-2 pt-2 border-t border-slate-700">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                    <User size={18} className="text-cyan-400" />
                    <span className="text-white">{user?.username}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors border border-slate-600"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-slate-700">
                  <button 
                    onClick={handleSignIn}
                    className="w-full px-6 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors font-medium border border-slate-600"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleSignUp}
                    className="w-full px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg transition-all font-medium shadow-lg shadow-cyan-500/30"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  );
};