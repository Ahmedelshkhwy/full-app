"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductById = exports.createProduct = exports.getAllProducts = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const getAllProducts = async (_req, res) => {
    try {
        const products = await product_model_1.default.find();
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء جلب المنتجات' });
    }
};
exports.getAllProducts = getAllProducts;
const createProduct = async (req, res) => {
    try {
        const product = await product_model_1.default.create(req.body);
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء إنشاء المنتج' });
    }
};
exports.createProduct = createProduct;
const getProductById = async (req, res) => {
    try {
        const product = await product_model_1.default.findById(req.params['productId']);
        if (!product) {
            return res.status(404).json({ message: 'المنتج غير موجود' });
        }
        return res.json(product);
    }
    catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء جلب المنتج' });
    }
};
exports.getProductById = getProductById;
//# sourceMappingURL=product.controller.js.map