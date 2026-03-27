import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { EntryService } from '../application/entry-service.js';
import {
  createEntrySchema,
  getEntrySchema,
  listEntriesFiltersSchema,
  lookupEntrySchema,
  updateEntrySchema,
} from '../domain/entry-schemas.js';
import { toHttpError } from './http-errors.js';

export async function registerRoutes(app: FastifyInstance, service: EntryService): Promise<void> {
  app.post('/entries', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const payload = createEntrySchema.parse(request.body);
      const entry = service.createEntry(payload);
      return reply.status(201).send(entry);
    } catch (error) {
      const httpError = toHttpError(error);
      return reply.status(httpError.statusCode).send(httpError.body);
    }
  });

  app.get('/entries', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const filters = listEntriesFiltersSchema.parse(request.query);
      return reply.send(service.listEntries(filters));
    } catch (error) {
      const httpError = toHttpError(error);
      return reply.status(httpError.statusCode).send(httpError.body);
    }
  });

  app.get('/entries/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = getEntrySchema.parse(request.params);
      return reply.send(service.getEntry(params.id));
    } catch (error) {
      const httpError = toHttpError(error);
      return reply.status(httpError.statusCode).send(httpError.body);
    }
  });

  app.patch('/entries/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = getEntrySchema.parse(request.params);
      const payload = updateEntrySchema.parse(request.body);
      return reply.send(service.updateEntry(params.id, payload));
    } catch (error) {
      const httpError = toHttpError(error);
      return reply.status(httpError.statusCode).send(httpError.body);
    }
  });

  app.delete('/entries/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = getEntrySchema.parse(request.params);
      service.deleteEntry(params.id);
      return reply.status(204).send();
    } catch (error) {
      const httpError = toHttpError(error);
      return reply.status(httpError.statusCode).send(httpError.body);
    }
  });

  app.get('/lookup', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = lookupEntrySchema.parse(request.query);
      return reply.send(service.lookupEntry(query.name));
    } catch (error) {
      const httpError = toHttpError(error);
      return reply.status(httpError.statusCode).send(httpError.body);
    }
  });
}
