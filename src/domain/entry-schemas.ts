import { z } from 'zod';

import { entryTypes, severityLevels } from './entry.js';

const isoDateTime = z.iso.datetime({ offset: true });
const isoDate = z.iso.date();

const nonEmptyString = z.string().trim().min(1);

const aliasesSchema = z.array(nonEmptyString);
const tagsSchema = z.array(nonEmptyString);
const evidenceLinksSchema = z.array(z.url());

export const createEntrySchema = z.object({
  type: z.enum(entryTypes),
  name: nonEmptyString,
  aliases: aliasesSchema.optional(),
  reason: nonEmptyString,
  tags: tagsSchema.optional(),
  evidenceLinks: evidenceLinksSchema.optional(),
  severity: z.enum(severityLevels),
  incidentDate: isoDate,
  expiresAt: isoDateTime.optional(),
});

export const updateEntrySchema = z.object({
  type: z.enum(entryTypes).optional(),
  name: nonEmptyString.optional(),
  aliases: aliasesSchema.optional(),
  reason: nonEmptyString.optional(),
  tags: tagsSchema.optional(),
  evidenceLinks: evidenceLinksSchema.optional(),
  severity: z.enum(severityLevels).optional(),
  incidentDate: isoDate.optional(),
  expiresAt: z.union([isoDateTime, z.null()]).optional(),
}).superRefine((value, context) => {
  const hasAnyValue = Object.values(value).some((fieldValue) => fieldValue !== undefined);

  if (!hasAnyValue) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one field must be provided',
    });
  }
});

export const listEntriesFiltersSchema = z.object({
  type: z.enum(entryTypes).optional(),
  severity: z.enum(severityLevels).optional(),
  tag: nonEmptyString.optional(),
});

export const lookupEntrySchema = z.object({
  name: nonEmptyString,
});

export const deleteEntrySchema = z.object({
  id: nonEmptyString,
});

export const getEntrySchema = z.object({
  id: nonEmptyString,
});
