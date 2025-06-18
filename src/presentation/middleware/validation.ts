import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/AppError';

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        next(new ValidationError(message));
      } else {
        next(error);
      }
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        next(new ValidationError(message));
      } else {
        next(error);
      }
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        next(new ValidationError(message));
      } else {
        next(error);
      }
    }
  };
};
