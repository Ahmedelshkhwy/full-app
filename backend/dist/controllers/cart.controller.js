"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartItemQuantity = exports.removeFromCart = exports.getCart = exports.addToCart = exports.createCart = exports.getAllCarts = void 0;
const cart_model_1 = __importDefault(require("../models/cart.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
// استيراد تعريف augmentation لخاصية user
//import '../types';
/**
 * جلب جميع السلات (خاصّ بالمسؤول أو لوحة التحكم)
 */
const getAllCarts = async (req, res) => {
    void req; // فقط للتغلّب على تحذير "declared but never used"
    try {
        const carts = await cart_model_1.default.find()
            .populate({
            path: 'items.productId',
            select: 'name price image stock'
        })
            .populate('user', 'username email');
        return res.status(200).json({ carts });
    }
    catch (error) {
        console.error('Error in getAllCarts:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء جلب السلات' });
    }
};
exports.getAllCarts = getAllCarts;
/**
 * إنشاء سلة جديدة – عادةً نادر الاستخدام
 */
const createCart = async (req, res) => {
    try {
        const cart = await cart_model_1.default.create(req.body);
        return res.status(201).json({ cart });
    }
    catch (error) {
        console.error('Error in createCart:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء السلة' });
    }
};
exports.createCart = createCart;
/**
 * إضافة منتج إلى سلة المستخدم (أو الجست)
 */
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user?.id ?? 'guest';
        console.log('Adding to cart:', { productId, quantity, userId }); // للتشخيص
        // التحقق من وجود المنتج والمخزون
        const product = await product_model_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'المنتج غير موجود' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({
                message: `الكمية المطلوبة غير متوفرة. المخزون المتاح: ${product.stock}`
            });
        }
        let cart = await cart_model_1.default.findOne({ user: userId });
        if (!cart) {
            cart = new cart_model_1.default({ user: userId, items: [] });
        }
        const existingItem = cart.items.find((item) => item.productId.toString() === productId);
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (product.stock < newQuantity) {
                return res.status(400).json({
                    message: `الكمية الإجمالية غير متوفرة. المخزون المتاح: ${product.stock}`
                });
            }
            existingItem.quantity = newQuantity;
        }
        else {
            cart.items.push({ productId, quantity });
        }
        await cart.save();
        console.log('Cart saved successfully'); // للتشخيص
        // إرجاع السلة مع تفاصيل المنتجات
        const populatedCart = await cart_model_1.default.findById(cart._id).populate({
            path: 'items.productId',
            select: 'name price image stock'
        });
        return res.status(200).json(populatedCart);
    }
    catch (error) {
        console.error('Error in addToCart:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء إضافة المنتج إلى السلة' });
    }
};
exports.addToCart = addToCart;
/**
 * جلب سلة المستخدم الحالي (أو الجست)
 */
const getCart = async (req, res) => {
    try {
        const userId = req.user?.id ?? 'guest';
        const cart = await cart_model_1.default.findOne({ user: userId }).populate({
            path: 'items.productId',
            select: 'name price image stock'
        });
        if (!cart) {
            return res.status(200).json({ items: [] }); // إرجاع سلة فارغة بدلاً من خطأ
        }
        console.log('Cart found for user:', userId); // للتشخيص
        return res.status(200).json(cart);
    }
    catch (error) {
        console.error('Error in getCart:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء جلب السلة' });
    }
};
exports.getCart = getCart;
/**
 * إزالة منتج من سلة المستخدم (أو الجست)
 */
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user?.id ?? 'guest';
        const productId = req.params['productId'];
        console.log('Removing from cart:', { productId, userId }); // للتشخيص
        const cart = await cart_model_1.default.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'السلة غير موجودة' });
        }
        cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
        await cart.save();
        console.log('Item removed successfully'); // للتشخيص
        // إرجاع السلة المحدثة مع تفاصيل المنتجات
        const updatedCart = await cart_model_1.default.findById(cart._id).populate({
            path: 'items.productId',
            select: 'name price image stock'
        });
        return res.status(200).json(updatedCart);
    }
    catch (error) {
        console.error('Error in removeFromCart:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء إزالة المنتج من السلة' });
    }
};
exports.removeFromCart = removeFromCart;
/**
 * تحديث كمية منتج في سلة المستخدم
 */
const updateCartItemQuantity = async (req, res) => {
    try {
        const userId = req.user?.id ?? 'guest';
        const productId = req.params['productId'];
        const { quantity } = req.body;
        console.log('Updating cart quantity:', { productId, quantity, userId }); // للتشخيص
        if (quantity <= 0) {
            return res.status(400).json({ message: 'الكمية يجب أن تكون أكبر من صفر' });
        }
        // التحقق من المخزون
        const product = await product_model_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'المنتج غير موجود' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({
                message: `الكمية المطلوبة غير متوفرة. المخزون المتاح: ${product.stock}`
            });
        }
        const cart = await cart_model_1.default.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'السلة غير موجودة' });
        }
        const item = cart.items.find((item) => item.productId.toString() === productId);
        if (!item) {
            return res.status(404).json({ message: 'المنتج غير موجود في السلة' });
        }
        item.quantity = quantity;
        await cart.save();
        console.log('Quantity updated successfully'); // للتشخيص
        // إرجاع السلة المحدثة مع تفاصيل المنتجات
        const updatedCart = await cart_model_1.default.findById(cart._id).populate({
            path: 'items.productId',
            select: 'name price image stock'
        });
        return res.status(200).json(updatedCart);
    }
    catch (error) {
        console.error('Error in updateCartItemQuantity:', error);
        return res.status(500).json({ message: 'حدث خطأ أثناء تحديث كمية المنتج' });
    }
};
exports.updateCartItemQuantity = updateCartItemQuantity;
//# sourceMappingURL=cart.controller.js.map