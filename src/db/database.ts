import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

class Database {
  private sqlite: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | IDBDatabase | null = null;

  async init() {
    if (typeof window !== 'undefined') {
      if (Capacitor.isNativePlatform()) {
        await this.initSQLite();
      } else {
        await this.initIndexedDB();
      }
    }
  }

  private async initSQLite() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    const db = await this.sqlite.createConnection('mydb', false, 'no-encryption', 1);
    await db.open();
    this.db = db;
    // Create tables if they don't exist
    await this.db.execute({ statements: `
      CREATE TABLE IF NOT EXISTS links (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, url TEXT, icon TEXT);
      CREATE TABLE IF NOT EXISTS tar_boxes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, url TEXT);
    `});
  }

  private async initIndexedDB() {
    return new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open('mydb', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore('links', { keyPath: 'id', autoIncrement: true });
        db.createObjectStore('tar_boxes', { keyPath: 'id', autoIncrement: true });
      };
    });
  }

  async getLinks() {
    if (typeof window === 'undefined') return [];
    if (Capacitor.isNativePlatform()) {
      const result = await (this.db as SQLiteDBConnection).query('SELECT * FROM links');
      return result.values;
    } else {
      return new Promise((resolve, reject) => {
        const transaction = (this.db as IDBDatabase).transaction(['links'], 'readonly');
        const store = transaction.objectStore('links');
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    }
  }

  async getTarBoxes() {
    if (typeof window === 'undefined') return [];
    if (Capacitor.isNativePlatform()) {
      const result = await (this.db as SQLiteDBConnection).query('SELECT * FROM tar_boxes');
      return result.values;
    } else {
      return new Promise((resolve, reject) => {
        const transaction = (this.db as IDBDatabase).transaction(['tar_boxes'], 'readonly');
        const store = transaction.objectStore('tar_boxes');
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
    }
  }

  // Add methods for inserting, updating, and deleting data as needed
}

export const db = new Database();