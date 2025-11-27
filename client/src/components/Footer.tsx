import React from "react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-slate-800 bg-slate-950/50 py-8 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-slate-400">
          © {currentYear} Nidavellir. All rights reserved. Made with{' '}
          <span className="text-cyan-400">♥</span> by the Nidavellir team.
        </p>
      </div>
    </footer>
  );
};