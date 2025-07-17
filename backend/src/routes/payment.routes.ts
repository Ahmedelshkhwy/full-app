// backend/routes/payment.routes.ts

import express from 'express';
import { 
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  handleWebhook,
  handlePayment // الدالة القديمة للتوافق
} from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// بدلاً من استخدام middlewares منفصلة، سأضع validation داخل الـ routes مباشرة

/**
 * @route   POST /api/payment/intent
 * @desc    إنشاء نية دفع جديدة
 * @access  Private
 */
router.post('/intent', 
  authenticate, 
  createPaymentIntent
);

/**
 * @route   POST /api/payment/confirm
 * @desc    تأكيد عملية الدفع
 * @access  Private
 */
router.post('/confirm',
  authenticate,
  confirmPayment
);

/**
 * @route   GET /api/payment/status/:paymentId
 * @desc    الحصول على حالة الدفع
 * @access  Private
 */
router.get('/status/:paymentId',
  authenticate,
  getPaymentStatus
);

/**
 * @route   POST /api/payment/webhook
 * @desc    استقبال webhooks من payment gateway
 * @access  Public
 */
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

/**
 * @route   POST /api/payment/process
 * @desc    معالجة الدفع (الطريقة القديمة)
 * @access  Private
 */
router.post('/process',
  authenticate,
  handlePayment
);

export default router;
