"use strict";
// backend/src/routes/category.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
/**
 * @route   GET /api/categories
 * @desc    Get all categories (public)
 */
router.get('/', category_controller_1.getAllCategories);
/**
 * @route   GET /api/categories/:id
 * @desc    Get single category by ID (public)
 */
router.get('/:id', category_controller_1.getCategoryById);
/**
 * @route   POST /api/categories
 * @desc    Create a new category (protected)
 */
router.post('/', auth_middleware_1.authenticate, category_controller_1.createCategory);
/**
 * @route   PUT /api/categories/:id
 * @desc    Update category (protected)
 */
router.put('/:id', auth_middleware_1.authenticate, category_controller_1.updateCategory);
/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (protected)
 */
router.delete('/:id', auth_middleware_1.authenticate, category_controller_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=category.routes.js.map