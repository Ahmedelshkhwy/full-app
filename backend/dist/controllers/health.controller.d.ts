import { Request, Response } from 'express';
export declare const healthCheck: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const simpleHealthCheck: (_req: Request, res: Response) => Response<any, Record<string, any>>;
export declare const systemInfo: (_req: Request, res: Response) => Response<any, Record<string, any>>;
