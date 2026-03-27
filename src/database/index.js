import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Initializes and returns a database instance
 * @param {string} dbPath - Path to the SQLite database file
 * @returns {Database} Database instance
 */
const initDatabase = (dbPath) => {
  // Ensure the directory exists
  const dbDir = dirname(dbPath);
  if (dbDir && dbDir !== '.') {
    mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(dbPath);

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');

  // Load and execute schema
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  return db;
};

export default initDatabase;
