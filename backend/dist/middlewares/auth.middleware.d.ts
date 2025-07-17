import { NextFunction, Request, Response } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role?: string;
    };
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
