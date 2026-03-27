import { z } from 'zod';

import {
  createEntrySchema,
  deleteEntrySchema,
  listEntriesFiltersSchema,
  lookupEntrySchema,
  updateEntrySchema,
} from '../domain/entry-schemas.js';

export const createEntryToolSchema = createEntrySchema;
export const listEntriesToolSchema = listEntriesFiltersSchema.partial().default({});
export const lookupEntryToolSchema = lookupEntrySchema;
export const deleteEntryToolSchema = deleteEntrySchema;

export const updateEntryToolSchema = z.object({
  id: z.string().trim().min(1),
  updates: updateEntrySchema,
});
