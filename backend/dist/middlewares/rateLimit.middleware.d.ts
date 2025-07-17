import { Request, Response, NextFunction } from 'express';
/**
 * إنشاء middleware لتقييد المعدل
 */
export declare const createRateLimiter: (windowMs?: number, // 15 دقيقة افتراضياً
max?: number, // 100 طلب افتراضياً
message?: string) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Rate limiter للعمليات العامة
 */
export declare const rateLimiter: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Rate limiter للعمليات الحساسة (مثل الدفع)
 */
export declare const strictRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Rate limiter للتسجيل والمصادقة
 */
export declare const authRateLimiter: (req: Request, res: Response, next: NextFunction) => void;
