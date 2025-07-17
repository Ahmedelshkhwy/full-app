import { Request, Response } from 'express';
/**
 * جلب جميع السلات (خاصّ بالمسؤول أو لوحة التحكم)
 */
export declare const getAllCarts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * إنشاء سلة جديدة – عادةً نادر الاستخدام
 */
export declare const createCart: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * إضافة منتج إلى سلة المستخدم (أو الجست)
 */
export declare const addToCart: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * جلب سلة المستخدم الحالي (أو الجست)
 */
export declare const getCart: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * إزالة منتج من سلة المستخدم (أو الجست)
 */
export declare const removeFromCart: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * تحديث كمية منتج في سلة المستخدم
 */
export declare const updateCartItemQuantity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
