export const entryTypes = ['company', 'person'] as const;

export type EntryType = (typeof entryTypes)[number];

export const severityLevels = [
  'watch',
  'warn',
  'blacklisted_temporary',
  'blacklisted',
] as const;

export type Severity = (typeof severityLevels)[number];

export interface BlacklistEntry {
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

export interface CreateEntryInput {
  type: EntryType;
  name: string;
  aliases?: string[] | undefined;
  reason: string;
  tags?: string[] | undefined;
  evidenceLinks?: string[] | undefined;
  severity: Severity;
  incidentDate: string;
  expiresAt?: string | undefined;
}

export interface UpdateEntryInput {
  type?: EntryType | undefined;
  name?: string | undefined;
  aliases?: string[] | undefined;
  reason?: string | undefined;
  tags?: string[] | undefined;
  evidenceLinks?: string[] | undefined;
  severity?: Severity | undefined;
  incidentDate?: string | undefined;
  expiresAt?: string | null | undefined;
}

export interface ListEntriesFilters {
  type?: EntryType | undefined;
  severity?: Severity | undefined;
  tag?: string | undefined;
}
