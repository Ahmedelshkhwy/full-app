"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePayment = exports.handleWebhook = exports.getPaymentStatus = exports.confirmPayment = exports.createPaymentIntent = void 0;
const payment_model_1 = __importDefault(require("../models/payment.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
const payment_service_1 = require("../services/payment.service");
/**
 * إنشاء نية دفع جديدة
 */
const createPaymentIntent = async (req, res) => {
    try {
        const { orderId, amount, currency = 'SAR' } = req.body;
        const userId = req.user.id;
        // التحقق من وجود الطلب
        const order = await order_model_1.default.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'الطلب غير موجود'
            });
        }
        // التحقق من ملكية الطلب
        if (order.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'غير مصرح لك بالوصول لهذا الطلب'
            });
        }
        // التحقق من مطابقة المبلغ
        if (order.totalAmount !== amount) {
            return res.status(400).json({
                success: false,
                message: 'المبلغ غير مطابق لمبلغ الطلب'
            });
        }
        // إنشاء سجل دفع جديد
        const payment = new payment_model_1.default({
            orderId,
            userId,
            amount,
            currency,
            paymentMethod: order.paymentMethod,
            status: 'pending'
        });
        await payment.save();
        // إنشاء نية الدفع مع payment gateway
        const paymentIntentData = await (0, payment_service_1.processPayment)(amount, order.paymentMethod);
        // تحديث بيانات الدفع
        payment.paymentIntentId = paymentIntentData.id;
        payment.gatewayResponse = paymentIntentData;
        payment.status = 'processing';
        await payment.save();
        return res.status(201).json({
            success: true,
            message: 'تم إنشاء نية الدفع بنجاح',
            data: {
                paymentId: payment._id,
                paymentIntentId: payment.paymentIntentId,
                clientSecret: paymentIntentData.client_secret,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status
            }
        });
    }
    catch (error) {
        console.error('خطأ في إنشاء نية الدفع:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في إنشاء نية الدفع',
            error: error.message
        });
    }
};
exports.createPaymentIntent = createPaymentIntent;
/**
 * تأكيد عملية الدفع
 */
const confirmPayment = async (req, res) => {
    try {
        const { paymentIntentId, paymentMethodId } = req.body;
        const userId = req.user.id;
        // البحث عن الدفع
        const payment = await payment_model_1.default.findOne({
            paymentIntentId,
            userId,
            status: 'processing'
        });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'عملية الدفع غير موجودة أو تم تأكيدها مسبقاً'
            });
        }
        // تأكيد الدفع مع payment gateway
        const confirmationResult = await (0, payment_service_1.confirmPaymentGateway)(paymentIntentId, paymentMethodId);
        // تحديث حالة الدفع
        payment.paymentMethodId = paymentMethodId;
        payment.transactionId = confirmationResult.id;
        payment.gatewayResponse = confirmationResult;
        payment.status = confirmationResult.status === 'paid' ? 'completed' : 'failed';
        if (confirmationResult.status === 'failed') {
            payment.failureReason = confirmationResult.failure_reason || 'فشل الدفع';
        }
        await payment.save();
        return res.status(200).json({
            success: true,
            message: payment.status === 'completed' ? 'تم تأكيد الدفع بنجاح' : 'فشل في تأكيد الدفع',
            data: {
                paymentId: payment._id,
                status: payment.status,
                transactionId: payment.transactionId,
                amount: payment.amount
            }
        });
    }
    catch (error) {
        console.error('خطأ في تأكيد الدفع:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في تأكيد الدفع',
            error: error.message
        });
    }
};
exports.confirmPayment = confirmPayment;
/**
 * الحصول على حالة الدفع
 */
const getPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const userId = req.user.id;
        const payment = await payment_model_1.default.findOne({
            _id: paymentId,
            userId
        }).populate('orderId', 'orderStatus totalAmount');
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'عملية الدفع غير موجودة'
            });
        }
        // إذا كانت الحالة processing، تحقق من gateway
        if (payment.status === 'processing' && payment.paymentIntentId) {
            try {
                const gatewayStatus = await (0, payment_service_1.getPaymentGatewayStatus)(payment.paymentIntentId);
                if (gatewayStatus.status !== payment.status) {
                    payment.status = gatewayStatus.status === 'paid' ? 'completed' : 'failed';
                    payment.gatewayResponse = gatewayStatus;
                    await payment.save();
                }
            }
            catch (error) {
                console.error('خطأ في الحصول على حالة الدفع من gateway:', error);
            }
        }
        return res.status(200).json({
            success: true,
            data: {
                paymentId: payment._id,
                orderId: payment.orderId,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                transactionId: payment.transactionId,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt
            }
        });
    }
    catch (error) {
        console.error('خطأ في الحصول على حالة الدفع:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في الحصول على حالة الدفع',
            error: error.message
        });
    }
};
exports.getPaymentStatus = getPaymentStatus;
/**
 * معالجة webhooks من payment gateway
 */
const handleWebhook = async (req, res) => {
    try {
        const payload = req.body;
        // TODO: التحقق من صحة signature
        // const signature = req.headers['x-signature'] || req.headers['x-webhook-signature'];
        // const isValid = verifyWebhookSignature(payload, signature);
        // if (!isValid) {
        //   return res.status(401).json({ success: false, message: 'Invalid signature' });
        // }
        // معالجة الحدث حسب النوع
        switch (payload.type) {
            case 'payment.succeeded':
                await handlePaymentSucceeded(payload.data);
                break;
            case 'payment.failed':
                await handlePaymentFailed(payload.data);
                break;
            case 'payment.refunded':
                await handlePaymentRefunded(payload.data);
                break;
            default:
                console.log('Unknown webhook event type:', payload.type);
        }
        return res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('خطأ في معالجة webhook:', error);
        return res.status(500).json({
            success: false,
            message: 'حدث خطأ في معالجة webhook',
            error: error.message
        });
    }
};
exports.handleWebhook = handleWebhook;
/**
 * معالجة حدث نجاح الدفع من webhook
 */
const handlePaymentSucceeded = async (paymentData) => {
    try {
        const payment = await payment_model_1.default.findOne({
            paymentIntentId: paymentData.id
        });
        if (payment && payment.status !== 'completed') {
            payment.status = 'completed';
            payment.transactionId = paymentData.id;
            payment.gatewayResponse = paymentData;
            await payment.save();
        }
    }
    catch (error) {
        console.error('خطأ في معالجة نجاح الدفع:', error);
    }
};
/**
 * معالجة حدث فشل الدفع من webhook
 */
const handlePaymentFailed = async (paymentData) => {
    try {
        const payment = await payment_model_1.default.findOne({
            paymentIntentId: paymentData.id
        });
        if (payment && payment.status !== 'failed') {
            payment.status = 'failed';
            payment.failureReason = paymentData.failure_reason || 'فشل الدفع';
            payment.gatewayResponse = paymentData;
            await payment.save();
        }
    }
    catch (error) {
        console.error('خطأ في معالجة فشل الدفع:', error);
    }
};
/**
 * معالجة حدث استرداد الدفع من webhook
 */
const handlePaymentRefunded = async (paymentData) => {
    try {
        const payment = await payment_model_1.default.findOne({
            transactionId: paymentData.id
        });
        if (payment) {
            payment.status = 'refunded';
            payment.refundAmount = paymentData.refund_amount;
            payment.refundReason = paymentData.refund_reason || 'استرداد من المتجر';
            payment.gatewayResponse = paymentData;
            await payment.save();
        }
    }
    catch (error) {
        console.error('خطأ في معالجة استرداد الدفع:', error);
    }
};
// إبقاء الدالة القديمة للتوافق مع الاستخدام الحالي
const handlePayment = async (req, res) => {
    console.log('handlePayment called - هذه الدالة قديمة، يرجى استخدام createPaymentIntent');
    try {
        const { total } = req.body;
        if (!total || typeof total !== 'number') {
            return res.status(400).json({ success: false, message: 'المبلغ غير صحيح' });
        }
        const paymentMethod = req.body.paymentMethod || 'default';
        const paymentResponse = await (0, payment_service_1.processPayment)(total, paymentMethod);
        return res.status(200).json({
            success: true,
            message: 'تمت معالجة الدفع بنجاح',
            data: paymentResponse,
        });
    }
    catch (error) {
        console.error('خطأ أثناء الدفع:', error?.response?.data || error);
        return res.status(500).json({ message: 'فشل الدفع عبر مويصار', error: error?.response?.data || error });
    }
};
exports.handlePayment = handlePayment;
//# sourceMappingURL=payment.controller.js.map