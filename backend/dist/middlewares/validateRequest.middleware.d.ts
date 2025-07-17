import { Request, Response, NextFunction } from 'express';
export declare const validateRequest: (schema: any) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateRegistration: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateLogin: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateProduct: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateOrder: (req: Request, res: Response, next: NextFunction) => void;
