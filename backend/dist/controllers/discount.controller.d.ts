import { Request, Response } from 'express';
export declare const getAvailableDiscounts: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const applyDiscount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createDiscount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateDiscount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteDiscount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllDiscounts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const toggleDiscountStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
