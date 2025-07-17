import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getAvailableOffers,
  getProductOffers,
  getCategoryOffers,
  calculateDiscountedPrice
} from '../controllers/offers.controller';

const router = Router();

// جلب العروض المتاحة للمستخدمين
router.get('/', authenticate, getAvailableOffers);

// جلب عروض منتج معين
router.get('/product/:productId', authenticate, getProductOffers);

// جلب عروض فئة معينة
router.get('/category/:categoryId', authenticate, getCategoryOffers);

// حساب السعر مع الخصم
router.post('/calculate-price', authenticate, calculateDiscountedPrice);

export default router;
