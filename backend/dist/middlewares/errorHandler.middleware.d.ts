import { Request, Response, NextFunction } from 'express';
interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare class CustomError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number);
}
export declare const errorHandler: (error: AppError, req: Request, res: Response, _next: NextFunction) => Response<any, Record<string, any>>;
export declare const notFound: (req: Request, res: Response) => Response<any, Record<string, any>>;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export {};
