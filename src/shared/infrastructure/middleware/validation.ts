// src/shared/infrastructure/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Middleware to validate request body against a Joi schema
 * @param schema Joi schema to validate against
 */
export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message),
      });
    }

    next();
  };
};

/**
 * Middleware to validate and convert path parameters
 * @param paramName Name of the parameter to validate
 * @param type Expected parameter type ('string' or 'number')
 */
export const validateParam = (paramName: string, type: 'string' | 'number') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const param = req.params[paramName];

    if (!param) {
      return res.status(400).json({
        message: `Missing required parameter: ${paramName}`,
      });
    }

    if (type === 'number') {
      const numValue = Number(param);
      if (isNaN(numValue)) {
        return res.status(400).json({
          message: `Parameter ${paramName} must be a number`,
        });
      }
      // Convert string param to number in req.params
      req.params[paramName] = numValue as any;
    }

    next();
  };
};

/**
 * Middleware to validate query parameters
 * @param paramName Name of the query parameter to validate
 * @param type Expected parameter type ('string' or 'number')
 * @param required Whether the parameter is required
 */
export const validateQuery = (paramName: string, type: 'string' | 'number', required = false) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const param = req.query[paramName];

    if (required && (param === undefined || param === null || param === '')) {
      return res.status(400).json({
        message: `Missing required query parameter: ${paramName}`,
      });
    }

    if (param !== undefined && param !== null && param !== '') {
      if (type === 'number') {
        const numValue = Number(param);
        if (isNaN(numValue)) {
          return res.status(400).json({
            message: `Query parameter ${paramName} must be a number`,
          });
        }
        // Convert string param to number in req.query
        req.query[paramName] = numValue as any;
      }
    }

    next();
  };
};
