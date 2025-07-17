
// backend/src/controllers/category.controller.ts

import { Request, Response } from 'express';
import Category from '../models/category.model';

/**
 * Get all categories
 */
export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories', error });
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params['id']);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch category', error });
  }
};

/**
 * Create a new category
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error });
  }
};

/**
 * Update a category
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params['id'],
      { name, description },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Category not found' });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update category', error });
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params['id']);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    return res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete category', error });
  }
};