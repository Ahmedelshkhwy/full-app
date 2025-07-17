// backend/src/routes/order.routes.ts
import express from 'express';
import {
  getAllOrders,
  getOrderById,
  deleteOrder,
  placeOrder,
  getMyOrders,
} from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// إنشاء طلب جديد
router.post('/', authenticate, placeOrder);

// الحصول على جميع الطلبات الخاصة بالمستخدم
router.get('/my-orders', authenticate, getMyOrders);

// الحصول على جميع الطلبات (للمسؤول)
router.get('/', authenticate, getAllOrders);

// الحصول على تفاصيل طلب معين بواسطة ID
router.get('/:orderId', authenticate, getOrderById);

// حذف طلب
router.delete('/:orderId', authenticate, deleteOrder);

export default router;