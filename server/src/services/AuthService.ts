import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/UserRepository';
import { User, SignupData, UserCredentials, AuthTokens, TokenPayload } from '../auth/types';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export class AuthService {
  private userRepository: UserRepository;
  private jwtSecret: string;
  private refreshSecret: string;

  constructor() {
    this.userRepository = new UserRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-this';
    
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.warn('⚠️  WARNING: Using default JWT secrets. Set JWT_SECRET and JWT_REFRESH_SECRET in production!');
    }
  }

  async signup(data: SignupData): Promise<{ user: User; tokens: AuthTokens }> {
    // Validate input
    this.validateSignupData(data);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await this.userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const userId = uuidv4();
    await this.userRepository.createUser(userId, data, passwordHash);

    // Get created user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('Failed to create user');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async login(credentials: UserCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // Find user
    const userWithPassword = await this.userRepository.findByEmail(credentials.email);
    if (!userWithPassword) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, userWithPassword.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await this.userRepository.updateLastLogin(userWithPassword.id);

    // Remove password hash from user object
    const { password_hash, ...user } = userWithPassword;

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, this.refreshSecret) as TokenPayload;

      // Check if token exists in database
      const tokenRecord = await this.userRepository.findRefreshToken(refreshToken);
      if (!tokenRecord) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Delete old refresh token
      await this.userRepository.deleteRefreshToken(refreshToken);

      return tokens;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.userRepository.deleteRefreshToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.userRepository.deleteAllUserRefreshTokens(userId);
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email
    };

    // Generate access token
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: ACCESS_TOKEN_EXPIRY
    });

    // Generate refresh token
    const refreshToken = jwt.sign(payload, this.refreshSecret, {
      expiresIn: REFRESH_TOKEN_EXPIRY
    });

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await this.userRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }

  private validateSignupData(data: SignupData): void {
    // Username validation
    if (!data.username || data.username.length < 3 || data.username.length > 50) {
      throw new Error('Username must be between 3 and 50 characters');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      throw new Error('Username can only contain letters, numbers, hyphens, and underscores');
    }

    // Email validation
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Invalid email address');
    }

    // Password validation
    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}