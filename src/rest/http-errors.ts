import { ZodError } from 'zod';

import { NotFoundError } from '../domain/errors.js';

export function toHttpError(error: unknown): { statusCode: number; body: { error: string } } {
  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      body: { error: error.issues.map((issue) => issue.message).join('; ') },
    };
  }

  if (error instanceof NotFoundError) {
    return {
      statusCode: 404,
      body: { error: error.message },
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      body: { error: error.message },
    };
  }

  return {
    statusCode: 500,
    body: { error: 'Unknown error' },
  };
}
