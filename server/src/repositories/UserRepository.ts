import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { User, SignupData, RefreshToken } from '../auth/types';

export class UserRepository {
  
  async createUser(userId: string, data: SignupData, passwordHash: string): Promise<void> {
    await pool.query(
      'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [userId, data.username, data.email, passwordHash]
    );
  }

  async findByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password_hash: row.password_hash,
      createdAt: row.created_at,
      lastLogin: row.last_login
    };
  }

  async findByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, created_at, last_login FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: row.created_at,
      lastLogin: row.last_login
    };
  }

  async findById(userId: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: row.created_at,
      lastLogin: row.last_login
    };
  }

  async updateLastLogin(userId: string): Promise<void> {
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      token: row.token,
      expiresAt: row.expires_at
    };
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE token = ?',
      [token]
    );
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE user_id = ?',
      [userId]
    );
  }

  async cleanupExpiredTokens(): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
    );
    return result.affectedRows;
  }
}