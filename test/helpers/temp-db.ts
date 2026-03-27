import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { EntryService } from '../../src/application/entry-service.js';
import { EntryRepository } from '../../src/db/entry-repository.js';
import { initializeSchema } from '../../src/db/schema.js';
import { openDatabase } from '../../src/db/sqlite.js';

export function createTestDatabase(): {
  databasePath: string;
  createService: () => EntryService;
  cleanup: () => void;
} {
  const directory = mkdtempSync(join(tmpdir(), 'blacklist-'));
  const databasePath = join(directory, 'test.sqlite');

  return {
    databasePath,
    createService: () => {
      const database = openDatabase(databasePath);
      initializeSchema(database);
      const repository = new EntryRepository(database);
      return new EntryService(repository);
    },
    cleanup: () => {
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

export function createTestService(): {
  service: EntryService;
  cleanup: () => void;
} {
  const context = createTestDatabase();
  const database = openDatabase(context.databasePath);
  initializeSchema(database);
  const repository = new EntryRepository(database);
  const service = new EntryService(repository);

  return {
    service,
    cleanup: () => {
      repository.close();
      context.cleanup();
    },
  };
}
