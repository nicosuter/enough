import type { BlacklistEntry, EntryType, Severity } from '../domain/entry.js';

export interface EntryRow {
  id: string;
  type: EntryType;
  name: string;
  reason: string;
  tags_json: string;
  evidence_links_json: string;
  severity: Severity;
  incident_date: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export function mapEntryRow(row: EntryRow, aliases: string[]): BlacklistEntry {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    aliases,
    reason: row.reason,
    tags: JSON.parse(row.tags_json) as string[],
    evidenceLinks: JSON.parse(row.evidence_links_json) as string[],
    severity: row.severity,
    incidentDate: row.incident_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.expires_at ? { expiresAt: row.expires_at } : {}),
  };
}
