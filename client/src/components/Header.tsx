// src/components/Header.tsx
import React, { useState } from "react";
import { Swords, User, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { AuthModal } from "./AuthModal";

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  const { user, isAuthenticated, logout } = useAuthStore();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <div className="brand-logo">
              <Swords className="logo-icon w-8 h-8 text-red-500" />

              <div className="brand-text">
                <span className="brand-name">Rock Paper Suffer</span>
                <span className="brand-tagline">May the Best Strategy win</span>
              </div>
            </div>
          </div>

          <button className="mobile-menu-toggle" onClick={toggleMenu}>
            <span className={`hamburger ${isMenuOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          <nav className={`header-nav ${isMenuOpen ? "open" : ""}`}>
            <a href="#" className="nav-link">Home</a>
            <a href="#" className="nav-link">Games</a>
            <a href="#" className="nav-link">Leaderboard</a>
            <a href="#" className="nav-link">How to Play</a>
            <a href="#" className="nav-link">About</a>
            
            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-info">
                  <User size={18} />
                  <span>{user?.username}</span>
                </div>
                <button onClick={handleLogout} className="nav-button logout">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button onClick={handleSignIn} className="nav-button-secondary">
                  Sign In
                </button>
                <button onClick={handleSignUp} className="nav-button">
                  Sign Up
                </button>
              </div>
            )}
          </nav>
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