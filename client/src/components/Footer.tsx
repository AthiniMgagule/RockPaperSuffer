import React from "react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} Nidavellir. All rights reserved. Made with{" "}
            <span className="footer-heart">♥</span> by the Nidavellir team.
          </p>
        </div>
      </div>
    </footer>
  );
};
