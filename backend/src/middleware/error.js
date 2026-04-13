import { ZodError } from 'zod';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues,
    });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  const details = err.details || null;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: message,
    details,
  });
}
