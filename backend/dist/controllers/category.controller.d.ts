import { Request, Response } from 'express';
/**
 * Get all categories
 */
export declare const getAllCategories: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Get category by ID
 */
export declare const getCategoryById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Create a new category
 */
export declare const createCategory: (req: Request, res: Response) => Promise<void>;
/**
 * Update a category
 */
export declare const updateCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Delete a category
 */
export declare const deleteCategory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
