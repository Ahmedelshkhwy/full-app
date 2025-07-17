import { Request, Response } from 'express';
export declare const sendRegistrationOTP: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const sendPasswordResetOTP: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyOTP: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resendOTP: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
