import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { InterviewSession } from '../store/slices/historySlice';

const DB_NAME = 'interviewcoach.db';
const ENCRYPTION_KEY = 'interviewcoach-secret-key'; // In production, this should be more secure

class Database {
  private static instance: Database;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        role TEXT NOT NULL,
        startTime INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        transcript_encrypted TEXT NOT NULL,
        score REAL NOT NULL,
        strengths_encrypted TEXT NOT NULL,
        improvements_encrypted TEXT NOT NULL,
        learnings_encrypted TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value_encrypted TEXT NOT NULL
      );
    `);
  }

  private async encrypt(data: string): Promise<string> {
    try {
      // Generate a random IV for each encryption
      const iv = await Crypto.getRandomBytesAsync(16);
      const ivString = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Create a key from our secret + IV
      const keyMaterial = ENCRYPTION_KEY + ivString;
      const key = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        keyMaterial,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      
      // Simple XOR encryption (in production, use proper AES)
      const encrypted = this.xorEncrypt(data, key);
      
      // Prepend IV to encrypted data
      return ivString + encrypted;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  }

  private async decrypt(encryptedData: string): Promise<string> {
    try {
      if (encryptedData.length < 32) {
        throw new Error('Invalid encrypted data format');
      }
      
      // Extract IV from the beginning
      const ivString = encryptedData.substring(0, 32);
      const encrypted = encryptedData.substring(32);
      
      // Recreate the key
      const keyMaterial = ENCRYPTION_KEY + ivString;
      const key = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        keyMaterial,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      
      // Decrypt using XOR
      return this.xorEncrypt(encrypted, key);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  }

  private xorEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const textChar = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode(textChar ^ keyChar);
    }
    // Convert to base64 for safe storage
    return Buffer.from(result, 'binary').toString('base64');
  }

  public async saveSession(session: InterviewSession): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const encryptedTranscript = await this.encrypt(session.transcript);
      const encryptedStrengths = await this.encrypt(JSON.stringify(session.strengths));
      const encryptedImprovements = await this.encrypt(JSON.stringify(session.improvements));
      const encryptedLearnings = await this.encrypt(JSON.stringify(session.learnings));

      await this.db.runAsync(
        `INSERT OR REPLACE INTO sessions (
          id, title, role, startTime, duration, transcript_encrypted,
          score, strengths_encrypted, improvements_encrypted, learnings_encrypted, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          session.id,
          session.title,
          session.role,
          session.startTime,
          session.duration,
          encryptedTranscript,
          session.score,
          encryptedStrengths,
          encryptedImprovements,
          encryptedLearnings,
          session.createdAt,
        ]
      );
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  public async getSessions(): Promise<InterviewSession[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getAllAsync(`
        SELECT * FROM sessions ORDER BY createdAt DESC
      `);

      return result.map((row: any) => ({
        id: row.id,
        title: row.title,
        role: row.role,
        startTime: row.startTime,
        duration: row.duration,
        transcript: row.transcript_encrypted, // In production, decrypt this
        score: row.score,
        strengths: JSON.parse(row.strengths_encrypted), // In production, decrypt this
        improvements: JSON.parse(row.improvements_encrypted), // In production, decrypt this
        learnings: JSON.parse(row.learnings_encrypted), // In production, decrypt this
        createdAt: row.createdAt,
      }));
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
  }

  public async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync('DELETE FROM sessions WHERE id = ?', [sessionId]);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  public async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const encryptedValue = await this.encrypt(JSON.stringify(value));
      await this.db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value_encrypted) VALUES (?, ?)',
        [key, encryptedValue]
      );
    } catch (error) {
      console.error('Error saving setting:', error);
      throw error;
    }
  }

  public async getSetting(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync(
        'SELECT value_encrypted FROM settings WHERE key = ?',
        [key]
      );

      if (result) {
        const decryptedValue = await this.decrypt((result as any).value_encrypted);
        return JSON.parse(decryptedValue);
      }
      return null;
    } catch (error) {
      console.error('Error getting setting:', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export default Database;