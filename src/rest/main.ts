import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { EntryRepository } from '../db/entry-repository.js';
import { initializeSchema } from '../db/schema.js';
import { openDatabase } from '../db/sqlite.js';
import { EntryService } from '../application/entry-service.js';
import { buildApp } from './app.js';

const databasePath = process.env.BLACKLIST_DB_PATH ?? './data/blacklist.sqlite';
const port = Number(process.env.PORT ?? '3000');

mkdirSync(dirname(databasePath), { recursive: true });

const database = openDatabase(databasePath);
initializeSchema(database);

const repository = new EntryRepository(database);
const service = new EntryService(repository);
const app = await buildApp(service);

await app.listen({ port, host: '0.0.0.0' });
