import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { TokenPayload } from '../auth/types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  // Middleware to verify JWT token
  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      const payload = this.authService.verifyAccessToken(token);
      req.user = payload;

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };

  // Optional authentication - doesn't fail if no token
  optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = this.authService.verifyAccessToken(token);
        req.user = payload;
      }

      next();
    } catch (error) {
      // Continue without user
      next();
    }
  };
}