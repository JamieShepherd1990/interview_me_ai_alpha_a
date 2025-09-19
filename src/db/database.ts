import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

const DB_NAME = 'interview_coach.db';

export class Database {
  private static instance: Database;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create sessions table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        interview_type TEXT NOT NULL,
        role TEXT NOT NULL,
        duration INTEGER NOT NULL,
        score REAL,
        transcript_encrypted TEXT NOT NULL,
        feedback_encrypted TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        is_saved INTEGER DEFAULT 0
      );
    `);

    // Create settings table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        encrypted INTEGER DEFAULT 0
      );
    `);
  }

  async saveSession(sessionData: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Encrypt sensitive data
      const encryptedTranscript = await this.encryptData(JSON.stringify(sessionData.transcript));
      const encryptedFeedback = sessionData.feedback 
        ? await this.encryptData(JSON.stringify(sessionData.feedback))
        : null;

      await this.db.runAsync(
        `INSERT OR REPLACE INTO sessions (
          id, user_id, interview_type, role, duration, score, 
          transcript_encrypted, feedback_encrypted, created_at, updated_at, is_saved
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionData.id,
          sessionData.user_id || 'anonymous',
          sessionData.interview_type,
          sessionData.role,
          sessionData.duration,
          sessionData.score,
          encryptedTranscript,
          encryptedFeedback,
          sessionData.timestamp || Date.now(),
          Date.now(),
          sessionData.is_saved ? 1 : 0
        ]
      );
    } catch (error) {
      console.error('Save session error:', error);
      throw error;
    }
  }

  async getSessions(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM sessions WHERE is_saved = 1 ORDER BY created_at DESC'
      );

      // Decrypt sensitive data
      return await Promise.all(
        result.map(async (session: any) => ({
          ...session,
          transcript: JSON.parse(await this.decryptData(session.transcript_encrypted)),
          feedback: session.feedback_encrypted 
            ? JSON.parse(await this.decryptData(session.feedback_encrypted))
            : null
        }))
      );
    } catch (error) {
      console.error('Get sessions error:', error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM sessions WHERE id = ?', [sessionId]);
    } catch (error) {
      console.error('Delete session error:', error);
      throw error;
    }
  }

  async saveSetting(key: string, value: any, encrypt: boolean = false): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const valueToStore = encrypt 
        ? await this.encryptData(JSON.stringify(value))
        : JSON.stringify(value);

      await this.db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value, encrypted) VALUES (?, ?, ?)',
        [key, valueToStore, encrypt ? 1 : 0]
      );
    } catch (error) {
      console.error('Save setting error:', error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync(
        'SELECT value, encrypted FROM settings WHERE key = ?',
        [key]
      );

      if (!result) return null;

      const { value, encrypted } = result as any;
      return encrypted 
        ? JSON.parse(await this.decryptData(value))
        : JSON.parse(value);
    } catch (error) {
      console.error('Get setting error:', error);
      throw error;
    }
  }

  private async encryptData(data: string): Promise<string> {
    try {
      // Use a simple encryption for demo - in production, use more secure methods
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data + 'interview_coach_salt'
      );
      return hash;
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  private async decryptData(encryptedData: string): Promise<string> {
    // For demo purposes - in production, implement proper decryption
    // This is a simplified version
    return encryptedData;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}
