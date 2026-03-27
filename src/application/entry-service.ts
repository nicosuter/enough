import type {
  BlacklistEntry,
  CreateEntryInput,
  ListEntriesFilters,
  UpdateEntryInput,
} from '../domain/entry.js';
import { NotFoundError } from '../domain/errors.js';
import { EntryRepository } from '../db/entry-repository.js';
import { generateId } from './id.js';
import { nowIso } from './time.js';

export class EntryService {
  constructor(private readonly repository: EntryRepository) {}

  createEntry(input: CreateEntryInput): BlacklistEntry {
    const timestamp = nowIso();

    return this.repository.create({
      id: generateId(),
      type: input.type,
      name: input.name,
      aliases: input.aliases ?? [],
      reason: input.reason,
      tags: input.tags ?? [],
      evidenceLinks: input.evidenceLinks ?? [],
      severity: input.severity,
      incidentDate: input.incidentDate,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
    });
  }

  getEntry(id: string): BlacklistEntry {
    const entry = this.repository.getById(id);

    if (!entry) {
      throw new NotFoundError(`Entry ${id} was not found`);
    }

    return entry;
  }

  listEntries(filters?: ListEntriesFilters): BlacklistEntry[] {
    return this.repository.list(filters);
  }

  updateEntry(id: string, input: UpdateEntryInput): BlacklistEntry {
    const existingEntry = this.repository.getById(id);

    if (!existingEntry) {
      throw new NotFoundError(`Entry ${id} was not found`);
    }

    const updatedEntry = this.repository.update(id, {
      id,
      type: input.type ?? existingEntry.type,
      name: input.name ?? existingEntry.name,
      aliases: input.aliases ?? existingEntry.aliases,
      reason: input.reason ?? existingEntry.reason,
      tags: input.tags ?? existingEntry.tags,
      evidenceLinks: input.evidenceLinks ?? existingEntry.evidenceLinks,
      severity: input.severity ?? existingEntry.severity,
      incidentDate: input.incidentDate ?? existingEntry.incidentDate,
      createdAt: existingEntry.createdAt,
      updatedAt: nowIso(),
      ...(input.expiresAt === undefined
        ? existingEntry.expiresAt
          ? { expiresAt: existingEntry.expiresAt }
          : {}
        : input.expiresAt === null
          ? {}
          : { expiresAt: input.expiresAt }),
    });

    if (!updatedEntry) {
      throw new NotFoundError(`Entry ${id} was not found`);
    }

    return updatedEntry;
  }

  deleteEntry(id: string): void {
    const deleted = this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundError(`Entry ${id} was not found`);
    }
  }

  lookupEntry(name: string): BlacklistEntry[] {
    return this.repository.lookupByNameOrAlias(name);
  }
}
