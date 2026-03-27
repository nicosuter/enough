import type Database from 'better-sqlite3';

import type {
  BlacklistEntry,
  EntryType,
  ListEntriesFilters,
  Severity,
} from '../domain/entry.js';
import { matchesNameOrAlias } from '../domain/matching.js';
import { mapEntryRow, type EntryRow } from './mappers.js';

interface StoredEntryInput {
  id: string;
  type: EntryType;
  name: string;
  aliases: string[];
  reason: string;
  tags: string[];
  evidenceLinks: string[];
  severity: Severity;
  incidentDate: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export class EntryRepository {
  constructor(private readonly database: Database.Database) {}

  close(): void {
    this.database.close();
  }

  create(entry: StoredEntryInput): BlacklistEntry {
    const insertEntry = this.database.prepare(`
      INSERT INTO entries (
        id, type, name, reason, tags_json, evidence_links_json, severity,
        incident_date, created_at, updated_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertAlias = this.database.prepare(`
      INSERT INTO entry_aliases (entry_id, alias) VALUES (?, ?)
    `);

    const transaction = this.database.transaction((value: StoredEntryInput) => {
      insertEntry.run(
        value.id,
        value.type,
        value.name,
        value.reason,
        JSON.stringify(value.tags),
        JSON.stringify(value.evidenceLinks),
        value.severity,
        value.incidentDate,
        value.createdAt,
        value.updatedAt,
        value.expiresAt ?? null,
      );

      for (const alias of value.aliases) {
        insertAlias.run(value.id, alias);
      }
    });

    transaction(entry);

    return this.getById(entry.id)!;
  }

  getById(id: string): BlacklistEntry | undefined {
    const row = this.database
      .prepare<[string], EntryRow>('SELECT * FROM entries WHERE id = ?')
      .get(id);

    if (!row) {
      return undefined;
    }

    return this.mapWithAliases(row);
  }

  list(filters?: ListEntriesFilters): BlacklistEntry[] {
    const clauses: string[] = [];
    const params: unknown[] = [];

    if (filters?.type) {
      clauses.push('type = ?');
      params.push(filters.type);
    }

    if (filters?.severity) {
      clauses.push('severity = ?');
      params.push(filters.severity);
    }

    if (filters?.tag) {
      clauses.push("EXISTS (SELECT 1 FROM json_each(entries.tags_json) WHERE json_each.value = ?)");
      params.push(filters.tag);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const rows = this.database
      .prepare<unknown[], EntryRow>(`SELECT * FROM entries ${whereClause} ORDER BY created_at DESC`)
      .all(...params);

    return rows.map((row) => this.mapWithAliases(row));
  }

  update(id: string, entry: StoredEntryInput): BlacklistEntry | undefined {
    const updateEntry = this.database.prepare(`
      UPDATE entries
      SET type = ?, name = ?, reason = ?, tags_json = ?, evidence_links_json = ?, severity = ?,
          incident_date = ?, created_at = ?, updated_at = ?, expires_at = ?
      WHERE id = ?
    `);

    const deleteAliases = this.database.prepare('DELETE FROM entry_aliases WHERE entry_id = ?');
    const insertAlias = this.database.prepare('INSERT INTO entry_aliases (entry_id, alias) VALUES (?, ?)');

    const transaction = this.database.transaction((value: StoredEntryInput) => {
      updateEntry.run(
        value.type,
        value.name,
        value.reason,
        JSON.stringify(value.tags),
        JSON.stringify(value.evidenceLinks),
        value.severity,
        value.incidentDate,
        value.createdAt,
        value.updatedAt,
        value.expiresAt ?? null,
        id,
      );

      deleteAliases.run(id);

      for (const alias of value.aliases) {
        insertAlias.run(id, alias);
      }
    });

    transaction(entry);

    return this.getById(id);
  }

  delete(id: string): boolean {
    const result = this.database.prepare('DELETE FROM entries WHERE id = ?').run(id);
    return result.changes > 0;
  }

  lookupByNameOrAlias(query: string): BlacklistEntry[] {
    const normalizedQuery = query.trim().toLowerCase();
    const rows = this.database
      .prepare<[string, string], EntryRow>(
        `
          SELECT DISTINCT entries.*
          FROM entries
          LEFT JOIN entry_aliases ON entry_aliases.entry_id = entries.id
          WHERE lower(trim(entries.name)) = ? OR lower(trim(entry_aliases.alias)) = ?
          ORDER BY entries.created_at DESC
        `,
      )
      .all(normalizedQuery, normalizedQuery);

    return rows
      .map((row) => this.mapWithAliases(row))
      .filter((entry) => matchesNameOrAlias(entry.name, entry.aliases, query));
  }

  private mapWithAliases(row: EntryRow): BlacklistEntry {
    const aliasRows = this.database
      .prepare<[string], { alias: string }>('SELECT alias FROM entry_aliases WHERE entry_id = ? ORDER BY alias ASC')
      .all(row.id);

    return mapEntryRow(
      row,
      aliasRows.map((aliasRow) => aliasRow.alias),
    );
  }
}
