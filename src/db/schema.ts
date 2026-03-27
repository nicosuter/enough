import type Database from 'better-sqlite3';

export function initializeSchema(database: Database.Database): void {
  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      reason TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      evidence_links_json TEXT NOT NULL,
      severity TEXT NOT NULL,
      incident_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS entry_aliases (
      entry_id TEXT NOT NULL,
      alias TEXT NOT NULL,
      PRIMARY KEY (entry_id, alias),
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_entries_name ON entries(name);
    CREATE INDEX IF NOT EXISTS idx_entry_aliases_alias ON entry_aliases(alias);
  `);
}
