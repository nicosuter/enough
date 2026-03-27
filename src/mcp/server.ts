import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { EntryService } from '../application/entry-service.js';
import type { BlacklistEntry } from '../domain/entry.js';
import {
  createEntryToolSchema,
  deleteEntryToolSchema,
  listEntriesToolSchema,
  lookupEntryToolSchema,
  updateEntryToolSchema,
} from './tool-schemas.js';

function formatToolResult(payload: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
    structuredContent: payload as Record<string, unknown>,
  };
}

function entrySchema() {
  return z.object({
    id: z.string(),
    type: z.enum(['company', 'person']),
    name: z.string(),
    aliases: z.array(z.string()),
    reason: z.string(),
    tags: z.array(z.string()),
    evidenceLinks: z.array(z.string()),
    severity: z.enum(['watch', 'warn', 'blacklisted_temporary', 'blacklisted']),
    incidentDate: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    expiresAt: z.string().optional(),
  });
}

function entriesSchema() {
  return z.object({
    entries: z.array(entrySchema()),
  });
}

function toStructuredEntry(entry: BlacklistEntry): Record<string, unknown> {
  return {
    ...entry,
  };
}

export function createMcpServer(service: EntryService): McpServer {
  const server = new McpServer({
    name: 'blacklist',
    version: '0.1.0',
  });

  server.registerTool(
    'lookupEntry',
    {
      title: 'Lookup entry',
      description: 'Look up blacklist entries by exact name or alias.',
      inputSchema: lookupEntryToolSchema,
      outputSchema: entriesSchema(),
    },
    async ({ name }) => formatToolResult({ entries: service.lookupEntry(name).map(toStructuredEntry) }),
  );

  server.registerTool(
    'listEntries',
    {
      title: 'List entries',
      description: 'List blacklist entries with optional type, severity, or tag filters.',
      inputSchema: listEntriesToolSchema,
      outputSchema: entriesSchema(),
    },
    async (filters) => formatToolResult({ entries: service.listEntries(filters).map(toStructuredEntry) }),
  );

  server.registerTool(
    'createEntry',
    {
      title: 'Create entry',
      description: 'Create a blacklist entry for a company or person.',
      inputSchema: createEntryToolSchema,
      outputSchema: entrySchema(),
    },
    async (input) => formatToolResult(toStructuredEntry(service.createEntry(input))),
  );

  server.registerTool(
    'updateEntry',
    {
      title: 'Update entry',
      description: 'Update an existing blacklist entry.',
      inputSchema: updateEntryToolSchema,
      outputSchema: entrySchema(),
    },
    async ({ id, updates }) => formatToolResult(toStructuredEntry(service.updateEntry(id, updates))),
  );

  server.registerTool(
    'deleteEntry',
    {
      title: 'Delete entry',
      description: 'Hard delete a blacklist entry.',
      inputSchema: deleteEntryToolSchema,
      outputSchema: z.object({ success: z.boolean() }),
    },
    async ({ id }) => {
      service.deleteEntry(id);
      return formatToolResult({ success: true });
    },
  );

  return server;
}
