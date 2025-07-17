"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFound = exports.errorHandler = exports.CustomError = void 0;
// Custom error class
class CustomError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
// Global error handler middleware
const errorHandler = (error, req, res, _next) => {
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
    }
    else if (error.name === 'CastError') {
        statusCode = 400;
        message = 'معرف غير صحيح';
    }
    else if (error.name === 'MongoError' && error.code === 11000) {
        statusCode = 400;
        message = 'البيانات موجودة مسبقاً';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'جلسة غير صالحة';
    }
    else if (error.name === 'TokenExpiredError') {
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
exports.errorHandler = errorHandler;
// 404 handler
const notFound = (req, res) => {
    return res.status(404).json({
        success: false,
        message: `المسار ${req.originalUrl} غير موجود`
    });
};
exports.notFound = notFound;
// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.middleware.js.map