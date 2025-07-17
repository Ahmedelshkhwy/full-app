import { Request, Response, NextFunction } from 'express';
export declare const isAccountantOrAdmin: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const isAccountant: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
