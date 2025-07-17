import { Request, Response } from 'express';
export declare const getAvailableOffers: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProductOffers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCategoryOffers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const calculateDiscountedPrice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
