import { Request, Response, NextFunction } from 'express';

interface RateLimitData {
  requests: number;
  resetTime: number;
}

// تخزين بيانات العدد في الذاكرة (يمكن استخدام Redis للإنتاج)
const store = new Map<string, RateLimitData>();

/**
 * تنظيف البيانات القديمة كل 5 دقائق
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of store.entries()) {
    if (now > data.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000); // 5 دقائق

/**
 * إنشاء middleware لتقييد المعدل
 */
export const createRateLimiter = (
  windowMs: number = 15 * 60 * 1000, // 15 دقيقة افتراضياً
  max: number = 100, // 100 طلب افتراضياً
  message: string = 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // الحصول على البيانات الحالية أو إنشاء جديدة
    let data = store.get(key);
    
    if (!data || now > data.resetTime) {
      // إنشاء بيانات جديدة
      data = {
        requests: 0,
        resetTime: now + windowMs
      };
    }
    
    // زيادة عدد الطلبات
    data.requests++;
    store.set(key, data);
    
    // التحقق من تجاوز الحد المسموح
    if (data.requests > max) {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((data.resetTime - now) / 1000)
      });
      return;
    }
    
    // إضافة معلومات الحد في الرأس
    res.set({
      'X-RateLimit-Limit': max.toString(),
      'X-RateLimit-Remaining': Math.max(0, max - data.requests).toString(),
      'X-RateLimit-Reset': new Date(data.resetTime).toISOString()
    });
    
    next();
  };
};

/**
 * Rate limiter للعمليات العامة
 */
export const rateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 دقيقة
  100, // 100 طلب
  'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً'
);

/**
 * Rate limiter للعمليات الحساسة (مثل الدفع)
 */
export const strictRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 دقيقة
  10, // 10 طلبات فقط
  'تم تجاوز الحد المسموح من عمليات الدفع، يرجى المحاولة لاحقاً'
);

/**
 * Rate limiter للتسجيل والمصادقة
 */
export const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 دقيقة
  5, // 5 محاولات فقط
  'تم تجاوز الحد المسموح من محاولات التسجيل، يرجى المحاولة لاحقاً'
);
