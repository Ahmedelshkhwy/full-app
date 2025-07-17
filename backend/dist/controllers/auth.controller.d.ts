import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<Response>;
export declare const login: (req: Request, res: Response) => Promise<Response>;
export declare const resetPasswordWithOTP: (req: Request, res: Response) => Promise<Response>;
