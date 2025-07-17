// backend/src/routes/category.routes.ts

import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories (public)
 */
router.get('/', getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID (public)
 */
router.get('/:id', getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Create a new category (protected)
 */
router.post('/', authenticate, createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category (protected)
 */
router.put('/:id', authenticate, updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (protected)
 */
router.delete('/:id', authenticate, deleteCategory);

export default router;