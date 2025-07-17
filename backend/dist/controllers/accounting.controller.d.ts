import { Request, Response } from 'express';
export declare const getSalesStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProductSalesReport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCategorySalesReport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDiscountUsageReport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCustomerReport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProfitLossReport: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAccountingDashboard: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
