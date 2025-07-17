import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
/**
 * إنشاء نية دفع جديدة
 */
export declare const createPaymentIntent: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * تأكيد عملية الدفع
 */
export declare const confirmPayment: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * الحصول على حالة الدفع
 */
export declare const getPaymentStatus: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * معالجة webhooks من payment gateway
 */
export declare const handleWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const handlePayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
