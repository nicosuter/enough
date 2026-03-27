import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { EntryService } from '../application/entry-service.js';
import { EntryRepository } from '../db/entry-repository.js';
import { initializeSchema } from '../db/schema.js';
import { openDatabase } from '../db/sqlite.js';
import { createMcpServer } from './server.js';

const databasePath = process.env.BLACKLIST_DB_PATH ?? './data/blacklist.sqlite';

mkdirSync(dirname(databasePath), { recursive: true });

const database = openDatabase(databasePath);
initializeSchema(database);

const repository = new EntryRepository(database);
const service = new EntryService(repository);
const server = createMcpServer(service);
const transport = new StdioServerTransport();

await server.connect(transport);
