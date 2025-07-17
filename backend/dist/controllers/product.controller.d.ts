import { Request, Response } from 'express';
export declare const getAllProducts: (_req: Request, res: Response) => Promise<void>;
export declare const createProduct: (req: Request, res: Response) => Promise<void>;
export declare const getProductById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
