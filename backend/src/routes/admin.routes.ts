import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getAllOrders, getOrderById, deleteOrder } from '../controllers/order.controller';
import { getAllCarts } from '../controllers/cart.controller';
import { getAllProducts } from '../controllers/product.controller';
import { getAllUsers } from '../controllers/user.controller';

const router = Router();

// Middleware للتحقق من أن المستخدم admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'غير مصرح لك بالوصول' });
  }
  next();
};

// إحصائيات عامة للوحة التحكم
router.get('/dashboard/stats', authenticate, requireAdmin, async (_req, res) => {
  try {
    const Order = require('../models/order.model').default;
    const User = require('../models/user.model').default;
    const Product = require('../models/product.model').default;

    const [
      totalOrders,
      totalUsers,
      totalProducts,
      pendingOrders,
      totalRevenue
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments({ orderStatus: 'processing' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    return res.json({
      stats: {
        totalOrders,
        totalUsers,
        totalProducts,
        pendingOrders,
        totalRevenue: revenue
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب الإحصائيات' });
  }
});

// جلب جميع الطلبات مع تفاصيل المستخدمين
router.get('/orders', authenticate, requireAdmin, getAllOrders);

// جلب طلب محدد
router.get('/orders/:orderId', authenticate, requireAdmin, getOrderById);

// حذف طلب
router.delete('/orders/:orderId', authenticate, requireAdmin, deleteOrder);

// جلب جميع السلات
router.get('/carts', authenticate, requireAdmin, getAllCarts);

// جلب جميع المنتجات
router.get('/products', authenticate, requireAdmin, getAllProducts);

// جلب جميع المستخدمين
router.get('/users', authenticate, requireAdmin, getAllUsers);

// تحديث حالة الطلب
router.patch('/orders/:orderId/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const { orderId } = req.params;

    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'حالة الطلب غير صحيحة' });
    }

    const Order = require('../models/order.model').default;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    ).populate({
      path: 'items.productId',
      select: 'name price image stock'
    }).populate('user', 'username email phone');

    if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    return res.json({ order });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تحديث حالة الطلب' });
  }
});

// تحديث حالة الدفع
router.patch('/orders/:orderId/payment', authenticate, requireAdmin, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const { orderId } = req.params;

    const validStatuses = ['pending', 'paid', 'failed'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'حالة الدفع غير صحيحة' });
    }

    const Order = require('../models/order.model').default;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    ).populate({
      path: 'items.productId',
      select: 'name price image stock'
    }).populate('user', 'username email phone');

    if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    return res.json({ order });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تحديث حالة الدفع' });
  }
});

// إدارة المنتجات
router.post('/products', authenticate, requireAdmin, async (req, res) => {
  try {
    const Product = require('../models/product.model').default;
    const product = new Product(req.body);
    await product.save();
    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء المنتج' });
  }
});

router.put('/products/:productId', authenticate, requireAdmin, async (req, res) => {
  try {
    const Product = require('../models/product.model').default;
    const product = await Product.findByIdAndUpdate(req.params['productId'], req.body, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ أثناء تحديث المنتج' });
  }
});

router.delete('/products/:productId', authenticate, requireAdmin, async (req, res) => {
  try {
    const Product = require('../models/product.model').default;
    const product = await Product.findByIdAndDelete(req.params['productId']);
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }
    return res.json({ message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ أثناء حذف المنتج' });
  }
});

// إدارة الخصومات
router.get('/discounts', authenticate, requireAdmin, async (_req, res) => {
  try {
    const Discount = require('../models/discount.model').default;
    const discounts = await Discount.find().sort({ createdAt: -1 });
    return res.json({ discounts });
  } catch (error) {
    console.error('Error getting discounts:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب الخصومات' });
  }
});

router.post('/discounts', authenticate, requireAdmin, async (req, res) => {
  try {
    const Discount = require('../models/discount.model').default;
    const discount = new Discount(req.body);
    await discount.save();
    return res.status(201).json(discount);
  } catch (error) {
    console.error('Error creating discount:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الخصم' });
  }
});

router.put('/discounts/:discountId', authenticate, requireAdmin, async (req, res) => {
  try {
    const Discount = require('../models/discount.model').default;
    const discount = await Discount.findByIdAndUpdate(
      req.params['discountId'],
      req.body,
      { new: true }
    );
    if (!discount) {
      return res.status(404).json({ message: 'الخصم غير موجود' });
    }
    return res.json(discount);
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ أثناء تحديث الخصم' });
  }
});

router.delete('/discounts/:discountId', authenticate, requireAdmin, async (req, res) => {
  try {
    const Discount = require('../models/discount.model').default;
    const discount = await Discount.findByIdAndDelete(req.params['discountId']);
    if (!discount) {
      return res.status(404).json({ message: 'الخصم غير موجود' });
    }
    return res.json({ message: 'تم حذف الخصم بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ أثناء حذف الخصم' });
  }
});

router.patch('/discounts/:discountId/toggle', authenticate, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const Discount = require('../models/discount.model').default;
    const discount = await Discount.findByIdAndUpdate(
      req.params['discountId'],
      { isActive },
      { new: true }
    );
    if (!discount) {
      return res.status(404).json({ message: 'الخصم غير موجود' });
    }
    return res.json(discount);
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ أثناء تحديث حالة الخصم' });
  }
});

// مسارات إدارة الفئات
router.get('/categories', authenticate, requireAdmin, async (_req, res) => {
  try {
    const Category = require('../models/category.model').default;
    const categories = await Category.find().sort({ name: 1 });
    return res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب الفئات' });
  }
});

router.post('/categories', authenticate, requireAdmin, async (req, res) => {
  try {
    const Category = require('../models/category.model').default;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'اسم الفئة مطلوب' });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'الفئة موجودة بالفعل' });
    }

    const category = new Category({
      name,
      description: description || ''
    });

    await category.save();
    return res.status(201).json({ category, message: 'تم إنشاء الفئة بنجاح' });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الفئة' });
  }
});

router.put('/categories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const Category = require('../models/category.model').default;
    const { name, description } = req.body;
    const categoryId = req.params['id'];

    if (!name) {
      return res.status(400).json({ message: 'اسم الفئة مطلوب' });
    }

    const existingCategory = await Category.findOne({ name, _id: { $ne: categoryId } });
    if (existingCategory) {
      return res.status(400).json({ message: 'الفئة موجودة بالفعل' });
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name, description: description || '' },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'الفئة غير موجودة' });
    }

    return res.json({ category, message: 'تم تحديث الفئة بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ أثناء تحديث الفئة' });
  }
});

router.delete('/categories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const Category = require('../models/category.model').default;
    const Product = require('../models/product.model').default;
    const categoryId = req.params['id'];

    // التحقق من وجود منتجات في هذه الفئة
    const productsInCategory = await Product.findOne({ category: categoryId });
    if (productsInCategory) {
      return res.status(400).json({ 
        message: 'لا يمكن حذف الفئة لوجود منتجات مرتبطة بها' 
      });
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'الفئة غير موجودة' });
    }

    return res.json({ message: 'تم حذف الفئة بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ أثناء حذف الفئة' });
  }
});

export default router; 