// src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthMiddleware } from '../middleware/auth.middleware';

export function createAuthRoutes(authService: AuthService, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // Signup
  router.post('/signup', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
      }

      const result = await authService.signup({ username, email, password });

      res.status(201).json({
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.login({ email, password });

      res.json({
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  // Refresh token
  router.post('/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const tokens = await authService.refreshAccessToken(refreshToken);

      res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  // Logout
  router.post('/logout', authMiddleware.authenticate, async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Logout all devices
  router.post('/logout-all', authMiddleware.authenticate, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      await authService.logoutAll(req.user.userId);

      res.json({ message: 'Logged out from all devices' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get current user
  router.get('/me', authMiddleware.authenticate, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      res.json({ user: req.user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}