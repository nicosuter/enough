import Database from 'better-sqlite3';

export function openDatabase(databasePath: string): Database.Database {
  return new Database(databasePath);
}
