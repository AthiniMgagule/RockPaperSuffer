export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
}

export interface RefreshToken {
  id: number;
  userId: string;
  token: string;
  expiresAt: Date;
}