"use strict";
// backend/src/controllers/category.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const category_model_1 = __importDefault(require("../models/category.model"));
/**
 * Get all categories
 */
const getAllCategories = async (_req, res) => {
    try {
        const categories = await category_model_1.default.find();
        return res.status(200).json(categories);
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to fetch categories', error });
    }
};
exports.getAllCategories = getAllCategories;
/**
 * Get category by ID
 */
const getCategoryById = async (req, res) => {
    try {
        const category = await category_model_1.default.findById(req.params['id']);
        if (!category)
            return res.status(404).json({ message: 'Category not found' });
        return res.status(200).json(category);
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to fetch category', error });
    }
};
exports.getCategoryById = getCategoryById;
/**
 * Create a new category
 */
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = new category_model_1.default({ name, description });
        await category.save();
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create category', error });
    }
};
exports.createCategory = createCategory;
/**
 * Update a category
 */
const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updated = await category_model_1.default.findByIdAndUpdate(req.params['id'], { name, description }, { new: true });
        if (!updated)
            return res.status(404).json({ message: 'Category not found' });
        return res.status(200).json(updated);
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to update category', error });
    }
};
exports.updateCategory = updateCategory;
/**
 * Delete a category
 */
const deleteCategory = async (req, res) => {
    try {
        const deleted = await category_model_1.default.findByIdAndDelete(req.params['id']);
        if (!deleted)
            return res.status(404).json({ message: 'Category not found' });
        return res.status(200).json({ message: 'Category deleted' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to delete category', error });
    }
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.controller.js.map