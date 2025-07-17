import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getAvailableDiscounts,
  applyDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getAllDiscounts,
  toggleDiscountStatus
} from '../controllers/discount.controller';

const router = Router();

// المسارات العامة للمستخدمين
router.get('/', authenticate, getAvailableDiscounts);
router.post('/apply', authenticate, applyDiscount);

// المسارات الخاصة بالمدراء - التحقق من الصلاحية يتم داخل الكونترولر
router.get('/admin/all', authenticate, getAllDiscounts);
router.post('/admin/create', authenticate, createDiscount);
router.put('/admin/:id', authenticate, updateDiscount);
router.delete('/admin/:id', authenticate, deleteDiscount);
router.patch('/admin/:id/toggle', authenticate, toggleDiscountStatus);

export default router;
