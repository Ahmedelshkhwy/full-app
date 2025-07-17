"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = exports.createRefund = exports.getPaymentGatewayStatus = exports.confirmPaymentGateway = exports.processPayment = void 0;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const buffer_1 = require("buffer");
/**
 * معالجة الدفع - الدالة الأساسية
 */
const processPayment = async (total, method) => {
    try {
        // بيانات الدفع الأساسية
        const baseData = {
            amount: total * 100,
            currency: 'SAR',
            description: 'طلب من صيدلية الشافي',
            callback_url: 'https://example.com/return',
            'source[type]': method,
        };
        // إذا كانت stcpay أضف رقم الجوال
        if (method === 'stcpay') {
            baseData['source[mobile]'] = '966500000000'; // رقم جوال تجريبي (يجب تغييره حسب الحاجة)
        }
        else if (method === 'creditcard') {
            baseData['source[name]'] = 'Test User';
            baseData['source[number]'] = '4111111111111111';
            baseData['source[cvc]'] = '123';
            baseData['source[month]'] = '01';
            baseData['source[year]'] = '2026';
        }
        const body = qs_1.default.stringify(baseData);
        const response = await axios_1.default.post('https://api.moyasar.com/v1/payments', body, {
            headers: {
                Authorization: 'Basic ' + buffer_1.Buffer.from(`${process.env['MOYASAR_API_KEY']}:`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        return response.data;
    }
    catch (error) {
        console.error('⚠️ Moyasar error:', error?.response?.data || error.message);
        throw new Error(error?.response?.data?.message || 'Payment failed');
    }
};
exports.processPayment = processPayment;
/**
 * تأكيد الدفع مع payment gateway
 */
const confirmPaymentGateway = async (paymentIntentId, paymentMethodId) => {
    try {
        const response = await axios_1.default.post(`https://api.moyasar.com/v1/payments/${paymentIntentId}/confirm`, qs_1.default.stringify({
            payment_method: paymentMethodId
        }), {
            headers: {
                Authorization: 'Basic ' + buffer_1.Buffer.from(`${process.env['MOYASAR_API_KEY']}:`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        return response.data;
    }
    catch (error) {
        console.error('⚠️ Payment confirmation error:', error?.response?.data || error.message);
        throw new Error(error?.response?.data?.message || 'Payment confirmation failed');
    }
};
exports.confirmPaymentGateway = confirmPaymentGateway;
/**
 * الحصول على حالة الدفع من payment gateway
 */
const getPaymentGatewayStatus = async (paymentIntentId) => {
    try {
        const response = await axios_1.default.get(`https://api.moyasar.com/v1/payments/${paymentIntentId}`, {
            headers: {
                Authorization: 'Basic ' + buffer_1.Buffer.from(`${process.env['MOYASAR_API_KEY']}:`).toString('base64'),
            }
        });
        return response.data;
    }
    catch (error) {
        console.error('⚠️ Payment status error:', error?.response?.data || error.message);
        throw new Error(error?.response?.data?.message || 'Failed to get payment status');
    }
};
exports.getPaymentGatewayStatus = getPaymentGatewayStatus;
/**
 * إنشاء استرداد
 */
const createRefund = async (paymentId, amount, reason) => {
    try {
        const refundData = {};
        if (amount) {
            refundData.amount = amount * 100; // تحويل إلى هلل
        }
        if (reason) {
            refundData.description = reason;
        }
        const response = await axios_1.default.post(`https://api.moyasar.com/v1/payments/${paymentId}/refund`, qs_1.default.stringify(refundData), {
            headers: {
                Authorization: 'Basic ' + buffer_1.Buffer.from(`${process.env['MOYASAR_API_KEY']}:`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        return response.data;
    }
    catch (error) {
        console.error('⚠️ Refund error:', error?.response?.data || error.message);
        throw new Error(error?.response?.data?.message || 'Refund failed');
    }
};
exports.createRefund = createRefund;
/**
 * التحقق من صحة webhook signature
 */
const verifyWebhookSignature = (_payload, _signature) => {
    try {
        // TODO: تطبيق التحقق من signature حسب documentation الخاص بـ Moyasar
        // const crypto = require('crypto');
        // const expectedSignature = crypto
        //   .createHmac('sha256', process.env.WEBHOOK_SECRET)
        //   .update(JSON.stringify(payload))
        //   .digest('hex');
        // return signature === expectedSignature;
        // مؤقتاً نقبل جميع الـ webhooks
        return true;
    }
    catch (error) {
        console.error('Webhook signature verification failed:', error);
        return false;
    }
};
exports.verifyWebhookSignature = verifyWebhookSignature;
//# sourceMappingURL=payment.service.js.map