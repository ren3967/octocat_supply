import type { Request, Response, NextFunction } from 'express';
/**
 * Error handling utilities for database operations
 */

export class DatabaseError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = 'DATABASE_ERROR', statusCode: number = 500) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends DatabaseError {
  constructor(entity: string, id: string | number) {
    super(`${entity} with ID ${id} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string) {
    super(`Validation error: ${message}`, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends DatabaseError {
  constructor(message: string) {
    super(`Conflict: ${message}`, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

/**
 * Handle database errors and convert SQLite-specific errors to appropriate types
 */
export function handleDatabaseError(error: unknown, entity?: string, id?: string | number): never {
  if (error instanceof DatabaseError) {
    throw error;
  }

  const sqliteError = error as { code?: string; message?: string };
  const message = error instanceof Error ? error.message : String(error);
  const constraintCodes = new Set([
    'SQLITE_CONSTRAINT',
    'SQLITE_CONSTRAINT_UNIQUE',
    'SQLITE_CONSTRAINT_FOREIGNKEY',
  ]);

  // SQLite constraint violation (UNIQUE, FOREIGN KEY, etc.)
  if (sqliteError.code && constraintCodes.has(sqliteError.code)) {
    if (sqliteError.message?.includes('UNIQUE')) {
      throw new ConflictError('Resource already exists');
    }
    if (sqliteError.message?.includes('FOREIGN KEY')) {
      throw new ValidationError('Invalid reference to related entity');
    }
    throw new ValidationError(sqliteError.message || message);
  }

  // SQLite busy/locked database
  if (sqliteError.code === 'SQLITE_BUSY') {
    throw new DatabaseError('Database is temporarily unavailable', 'DATABASE_BUSY', 503);
  }

  // Handle case where no rows were affected (for updates/deletes)
  if (sqliteError.message && sqliteError.message.includes('No rows affected') && entity && id) {
    throw new NotFoundError(entity, id);
  }

  throw new DatabaseError(`Database operation failed: ${message}`, 'DATABASE_ERROR', 500);
}

/**
 * Express error handler middleware for database errors
 */
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof DatabaseError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  // Default error handling
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
