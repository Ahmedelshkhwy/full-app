"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrder = exports.validateProduct = exports.validateLogin = exports.validateRegistration = exports.validateRequest = void 0;
const errorHandler_middleware_1 = require("./errorHandler.middleware");
// Validation helper functions
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const isValidPhone = (phone) => {
    const phoneRegex = /^(\+966|966|0)?5[0-9]{8}$/;
    return phoneRegex.test(phone);
};
const isValidPassword = (password) => {
    return password.length >= 6;
};
const sanitizeString = (str) => {
    return str.trim().replace(/[<>]/g, '');
};
// Generic validation middleware
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const { error } = schema.validate(req.body);
            if (error) {
                throw new errorHandler_middleware_1.CustomError(error.details[0].message, 400);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
// Registration validation
const validateRegistration = (req, res, next) => {
    try {
        const { username, email, password, phone } = req.body;
        const errors = [];
        // Username validation
        if (!username || username.length < 3) {
            errors.push('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
        }
        // Email validation
        if (!email || !isValidEmail(email)) {
            errors.push('البريد الإلكتروني غير صحيح');
        }
        // Password validation
        if (!password || !isValidPassword(password)) {
            errors.push('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        }
        // Phone validation
        if (!phone || !isValidPhone(phone)) {
            errors.push('رقم الجوال غير صحيح');
        }
        if (errors.length > 0) {
            throw new errorHandler_middleware_1.CustomError(errors.join(', '), 400);
        }
        // Sanitize inputs
        req.body.username = sanitizeString(username);
        req.body.email = email.toLowerCase().trim();
        req.body.phone = phone.trim();
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateRegistration = validateRegistration;
// Login validation
const validateLogin = (req, res, next) => {
    try {
        const { email, password } = req.body;
        const errors = [];
        if (!email || !isValidEmail(email)) {
            errors.push('البريد الإلكتروني غير صحيح');
        }
        if (!password) {
            errors.push('كلمة المرور مطلوبة');
        }
        if (errors.length > 0) {
            throw new errorHandler_middleware_1.CustomError(errors.join(', '), 400);
        }
        // Sanitize email
        req.body.email = email.toLowerCase().trim();
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateLogin = validateLogin;
// Product validation
const validateProduct = (req, res, next) => {
    try {
        const { name, price, category, stock } = req.body;
        const errors = [];
        if (!name || name.length < 2) {
            errors.push('اسم المنتج يجب أن يكون حرفين على الأقل');
        }
        if (!price || price <= 0) {
            errors.push('السعر يجب أن يكون رقماً موجباً');
        }
        if (!category) {
            errors.push('الفئة مطلوبة');
        }
        if (stock !== undefined && stock < 0) {
            errors.push('المخزون يجب أن يكون رقماً موجباً');
        }
        if (errors.length > 0) {
            throw new errorHandler_middleware_1.CustomError(errors.join(', '), 400);
        }
        // Sanitize name
        req.body.name = sanitizeString(name);
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateProduct = validateProduct;
// Order validation
const validateOrder = (req, res, next) => {
    try {
        const { items, shippingAddress, paymentMethod } = req.body;
        const errors = [];
        if (!items || !Array.isArray(items) || items.length === 0) {
            errors.push('المنتجات مطلوبة');
        }
        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
            errors.push('عنوان التوصيل مطلوب');
        }
        if (!paymentMethod || !['cash', 'card', 'stcpay'].includes(paymentMethod)) {
            errors.push('طريقة الدفع غير صحيحة');
        }
        if (errors.length > 0) {
            throw new errorHandler_middleware_1.CustomError(errors.join(', '), 400);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateOrder = validateOrder;
//# sourceMappingURL=validateRequest.middleware.js.map