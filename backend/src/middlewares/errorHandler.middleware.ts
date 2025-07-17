import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Custom error class
export class CustomError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let { statusCode = 500, message } = error;

  // Log error for debugging
  console.error('🚨 Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'بيانات غير صحيحة';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'معرف غير صحيح';
  } else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 400;
    message = 'البيانات موجودة مسبقاً';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'جلسة غير صالحة';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'انتهت صلاحية الجلسة';
  }

  // Don't leak error details in production
  if (process.env['NODE_ENV'] === 'production' && statusCode === 500) {
    message = 'حدث خطأ في الخادم';
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env['NODE_ENV'] === 'development' && { stack: error.stack })
  });
};

// 404 handler
export const notFound = (req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: `المسار ${req.originalUrl} غير موجود`
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
