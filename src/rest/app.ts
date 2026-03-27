import Fastify, { type FastifyInstance } from 'fastify';

import { EntryService } from '../application/entry-service.js';
import { registerRoutes } from './routes.js';

export async function buildApp(service: EntryService): Promise<FastifyInstance> {
  const app = Fastify();
  await registerRoutes(app, service);
  return app;
}
