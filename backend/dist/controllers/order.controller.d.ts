import { Request, Response } from 'express';
export declare const getAllOrders: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getOrderById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const placeOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMyOrders: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
