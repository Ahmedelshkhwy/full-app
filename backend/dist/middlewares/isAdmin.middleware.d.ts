import { Request, Response, NextFunction } from 'express';
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const isAdminOrAccountant: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
