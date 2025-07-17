import { Request, Response } from 'express';
export declare const getUserProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllUsers: (_req: Request, res: Response) => Promise<void>;
