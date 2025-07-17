import { Request, Response, NextFunction } from 'express';
/**
 * التحقق من بيانات طلب الدفع
 */
export declare const validatePaymentRequest: (req: Request, res: Response, next: NextFunction) => void;
/**
 * التحقق من بيانات تأكيد الدفع
 */
export declare const validatePaymentConfirmation: (req: Request, res: Response, next: NextFunction) => void;
/**
 * التحقق من معرف الدفع في المسار
 */
export declare const validatePaymentId: (req: Request, res: Response, next: NextFunction) => void;
/**
 * التحقق من بيانات الاسترداد
 */
export declare const validateRefundRequest: (req: Request, res: Response, next: NextFunction) => void;
