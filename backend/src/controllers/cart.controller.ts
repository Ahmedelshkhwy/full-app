import { Request, Response } from 'express';
import Cart from '../models/cart.model';
import Product from '../models/product.model';
// استيراد تعريف augmentation لخاصية user
//import '../types';

/**
 * جلب جميع السلات (خاصّ بالمسؤول أو لوحة التحكم)
 */
export const getAllCarts = async (req: Request, res: Response) => {
  void req; // فقط للتغلّب على تحذير "declared but never used"
  try {
    const carts = await Cart.find()
      .populate({
        path: 'items.productId',
        select: 'name price image stock'
      })
      .populate('user', 'username email');
    return res.status(200).json({ carts });
  } catch (error) {
    console.error('Error in getAllCarts:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب السلات' });
  }
};

/**
 * إنشاء سلة جديدة – عادةً نادر الاستخدام
 */
export const createCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.create(req.body);
    return res.status(201).json({ cart });
  } catch (error) {
    console.error('Error in createCart:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء السلة' });
  }
};

/**
 * إضافة منتج إلى سلة المستخدم (أو الجست)
 */
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?.id ?? 'guest';

    console.log('Adding to cart:', { productId, quantity, userId }); // للتشخيص

    // التحقق من وجود المنتج والمخزون
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `الكمية المطلوبة غير متوفرة. المخزون المتاح: ${product.stock}` 
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          message: `الكمية الإجمالية غير متوفرة. المخزون المتاح: ${product.stock}` 
        });
      }
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    console.log('Cart saved successfully'); // للتشخيص
    
    // إرجاع السلة مع تفاصيل المنتجات
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price image stock'
    });
    
    return res.status(200).json(populatedCart);
  } catch (error) {
    console.error('Error in addToCart:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء إضافة المنتج إلى السلة' });
  }
};

/**
 * جلب سلة المستخدم الحالي (أو الجست)
 */
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id ?? 'guest';
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.productId',
      select: 'name price image stock'
    });
    
    if (!cart) {
      return res.status(200).json({ items: [] }); // إرجاع سلة فارغة بدلاً من خطأ
    }
    
    console.log('Cart found for user:', userId); // للتشخيص
    return res.status(200).json(cart);
  } catch (error) {
    console.error('Error in getCart:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب السلة' });
  }
};

/**
 * إزالة منتج من سلة المستخدم (أو الجست)
 */
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id ?? 'guest';
    const productId = req.params['productId'];

    console.log('Removing from cart:', { productId, userId }); // للتشخيص

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'السلة غير موجودة' });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();

    console.log('Item removed successfully'); // للتشخيص
    
    // إرجاع السلة المحدثة مع تفاصيل المنتجات
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price image stock'
    });
    
    return res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Error in removeFromCart:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء إزالة المنتج من السلة' });
  }
};

/**
 * تحديث كمية منتج في سلة المستخدم
 */
export const updateCartItemQuantity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id ?? 'guest';
    const productId = req.params['productId'];
    const { quantity } = req.body;

    console.log('Updating cart quantity:', { productId, quantity, userId }); // للتشخيص

    if (quantity <= 0) {
      return res.status(400).json({ message: 'الكمية يجب أن تكون أكبر من صفر' });
    }

    // التحقق من المخزون
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `الكمية المطلوبة غير متوفرة. المخزون المتاح: ${product.stock}` 
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'السلة غير موجودة' });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    if (!item) {
      return res.status(404).json({ message: 'المنتج غير موجود في السلة' });
    }

    item.quantity = quantity;
    await cart.save();

    console.log('Quantity updated successfully'); // للتشخيص
    
    // إرجاع السلة المحدثة مع تفاصيل المنتجات
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price image stock'
    });
    
    return res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Error in updateCartItemQuantity:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تحديث كمية المنتج' });
  }
};
