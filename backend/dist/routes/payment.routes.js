"use strict";
// backend/routes/payment.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// بدلاً من استخدام middlewares منفصلة، سأضع validation داخل الـ routes مباشرة
/**
 * @route   POST /api/payment/intent
 * @desc    إنشاء نية دفع جديدة
 * @access  Private
 */
router.post('/intent', auth_middleware_1.authenticate, payment_controller_1.createPaymentIntent);
/**
 * @route   POST /api/payment/confirm
 * @desc    تأكيد عملية الدفع
 * @access  Private
 */
router.post('/confirm', auth_middleware_1.authenticate, payment_controller_1.confirmPayment);
/**
 * @route   GET /api/payment/status/:paymentId
 * @desc    الحصول على حالة الدفع
 * @access  Private
 */
router.get('/status/:paymentId', auth_middleware_1.authenticate, payment_controller_1.getPaymentStatus);
/**
 * @route   POST /api/payment/webhook
 * @desc    استقبال webhooks من payment gateway
 * @access  Public
 */
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), payment_controller_1.handleWebhook);
/**
 * @route   POST /api/payment/process
 * @desc    معالجة الدفع (الطريقة القديمة)
 * @access  Private
 */
router.post('/process', auth_middleware_1.authenticate, payment_controller_1.handlePayment);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map