import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'exercises.db');

export function createSchema(db) {
  // Exercises table
  db.exec(`
    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      bodyPart TEXT,
      primaryMuscles TEXT NOT NULL, -- JSON array
      secondaryMuscles TEXT NOT NULL, -- JSON array
      equipment TEXT NOT NULL, -- JSON array
      category TEXT NOT NULL,
      level TEXT NOT NULL,
      description TEXT,
      instructions TEXT NOT NULL, -- JSON array
      imageUrls TEXT NOT NULL, -- JSON array
      sourceId TEXT,
      tags TEXT NOT NULL, -- JSON array
      force TEXT,
      mechanic TEXT,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);

  // Create indexes for common queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_exercises_bodyPart ON exercises(bodyPart);
    CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
    CREATE INDEX IF NOT EXISTS idx_exercises_level ON exercises(level);
    CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);
  `);

  // Sync metadata table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_metadata (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lastSyncDate INTEGER NOT NULL,
      lastCommitSha TEXT,
      version TEXT,
      exerciseCount INTEGER,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);
}

export function getDatabase() {
  const db = new Database(dbPath);
  createSchema(db);
  return db;
}


