"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRefundRequest = exports.validatePaymentId = exports.validatePaymentConfirmation = exports.validatePaymentRequest = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * التحقق من صحة معرف MongoDB
 */
const isValidObjectId = (id) => {
    return mongoose_1.default.Types.ObjectId.isValid(id);
};
/**
 * التحقق من صحة الرقم الموجب
 */
const isPositiveNumber = (value) => {
    return typeof value === 'number' && value > 0;
};
/**
 * التحقق من صحة العملة
 */
const isValidCurrency = (currency) => {
    const validCurrencies = ['SAR', 'USD', 'EUR'];
    return validCurrencies.includes(currency);
};
/**
 * التحقق من بيانات طلب الدفع
 */
const validatePaymentRequest = (req, res, next) => {
    const { orderId, amount, currency } = req.body;
    const errors = [];
    // التحقق من معرف الطلب
    if (!orderId || !isValidObjectId(orderId)) {
        errors.push('معرف الطلب غير صحيح');
    }
    // التحقق من المبلغ
    if (!amount || !isPositiveNumber(amount)) {
        errors.push('المبلغ يجب أن يكون رقماً موجباً');
    }
    // التحقق من العملة
    if (!currency || !isValidCurrency(currency)) {
        errors.push('العملة غير مدعومة');
    }
    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            message: 'بيانات غير صحيحة',
            errors
        });
        return;
    }
    next();
};
exports.validatePaymentRequest = validatePaymentRequest;
/**
 * التحقق من بيانات تأكيد الدفع
 */
const validatePaymentConfirmation = (req, res, next) => {
    const { paymentIntentId, paymentMethodId } = req.body;
    const errors = [];
    if (!paymentIntentId || typeof paymentIntentId !== 'string' || paymentIntentId.trim() === '') {
        errors.push('معرف نية الدفع مطلوب');
    }
    if (!paymentMethodId || typeof paymentMethodId !== 'string' || paymentMethodId.trim() === '') {
        errors.push('معرف طريقة الدفع مطلوب');
    }
    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            message: 'بيانات غير صحيحة',
            errors
        });
        return;
    }
    next();
};
exports.validatePaymentConfirmation = validatePaymentConfirmation;
/**
 * التحقق من معرف الدفع في المسار
 */
const validatePaymentId = (req, res, next) => {
    const { paymentId } = req.params;
    if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
        res.status(400).json({
            success: false,
            message: 'معرف الدفع مطلوب'
        });
        return;
    }
    next();
};
exports.validatePaymentId = validatePaymentId;
/**
 * التحقق من بيانات الاسترداد
 */
const validateRefundRequest = (req, res, next) => {
    const { paymentId, amount, reason } = req.body;
    const errors = [];
    if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
        errors.push('معرف الدفع مطلوب');
    }
    if (amount !== undefined && !isPositiveNumber(amount)) {
        errors.push('مبلغ الاسترداد يجب أن يكون رقماً موجباً');
    }
    if (reason !== undefined && (typeof reason !== 'string' || reason.length > 500)) {
        errors.push('سبب الاسترداد لا يجب أن يتجاوز 500 حرف');
    }
    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            message: 'بيانات غير صحيحة',
            errors
        });
        return;
    }
    next();
};
exports.validateRefundRequest = validateRefundRequest;
//# sourceMappingURL=validation.middleware.js.map