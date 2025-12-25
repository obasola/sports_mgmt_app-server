// mtfpictures-server/src/presentation/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { ApiResponse } from '../../shared/types/common';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: error.message,
    });
    return;
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
  });
};

