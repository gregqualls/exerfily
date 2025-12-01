import { getDatabase } from './schema.js';

let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = getDatabase();
    // Enable foreign keys and other optimizations
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
  }
  return dbInstance;
}

export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}


