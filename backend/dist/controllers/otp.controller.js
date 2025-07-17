"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOTP = exports.verifyOTP = exports.sendPasswordResetOTP = exports.sendRegistrationOTP = void 0;
const otp_service_1 = require("../services/otp.service");
const user_model_1 = __importDefault(require("../models/user.model"));
// إرسال OTP للتسجيل
const sendRegistrationOTP = async (req, res) => {
    try {
        const { email, phone, method = 'email' } = req.body;
        if (!email && !phone) {
            return res.status(400).json({
                message: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف'
            });
        }
        // التحقق من عدم وجود المستخدم مسبقاً
        if (email) {
            const existingUser = await user_model_1.default.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    message: 'البريد الإلكتروني مُسجل مسبقاً'
                });
            }
        }
        if (phone) {
            const existingUser = await user_model_1.default.findOne({ phone });
            if (existingUser) {
                return res.status(400).json({
                    message: 'رقم الهاتف مُسجل مسبقاً'
                });
            }
        }
        // إرسال OTP
        let result = null;
        let identifier = '';
        if (method === 'email' && email) {
            result = await otp_service_1.otpService.sendEmailOTP(email, 'register');
            identifier = email;
        }
        else if (method === 'sms' && phone) {
            // SMS غير مفعل حالياً - استخدم email بدلاً منه
            result = await otp_service_1.otpService.sendEmailOTP(email || phone, 'register');
            identifier = email || phone;
        }
        if (result && result.success) {
            return res.json({
                success: true,
                message: `تم إرسال رمز التحقق إلى ${method === 'email' ? 'البريد الإلكتروني' : 'رقم الهاتف'}`,
                identifier: identifier.replace(/(.{3}).*(.{3})/, '$1***$2') // إخفاء جزء من المعرف
            });
        }
        else {
            return res.status(500).json({
                success: false,
                message: 'حدث خطأ في إرسال رمز التحقق'
            });
        }
    }
    catch (error) {
        console.error('Error sending registration OTP:', error);
        return res.status(500).json({
            message: 'حدث خطأ في الخادم'
        });
    }
};
exports.sendRegistrationOTP = sendRegistrationOTP;
// إرسال OTP لاستعادة كلمة المرور
const sendPasswordResetOTP = async (req, res) => {
    try {
        const { email, phone, method = 'email' } = req.body;
        if (!email && !phone) {
            return res.status(400).json({
                message: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف'
            });
        }
        // التحقق من وجود المستخدم
        let user = null;
        if (email) {
            user = await user_model_1.default.findOne({ email });
        }
        else if (phone) {
            user = await user_model_1.default.findOne({ phone });
        }
        if (!user) {
            return res.status(404).json({
                message: 'المستخدم غير موجود'
            });
        }
        // إرسال OTP
        let result = null;
        let identifier = '';
        if (method === 'email' && user.email) {
            result = await otp_service_1.otpService.sendEmailOTP(user.email, 'reset-password');
            identifier = user.email;
        }
        else if (method === 'sms' && user.phone) {
            // SMS غير مفعل - استخدم email
            result = await otp_service_1.otpService.sendEmailOTP(user.email, 'reset-password');
            identifier = user.email;
        }
        if (result && result.success) {
            return res.json({
                success: true,
                message: `تم إرسال رمز التحقق إلى ${method === 'email' ? 'البريد الإلكتروني' : 'رقم الهاتف'}`,
                identifier: identifier.replace(/(.{3}).*(.{3})/, '$1***$2')
            });
        }
        else {
            return res.status(500).json({
                success: false,
                message: 'حدث خطأ في إرسال رمز التحقق'
            });
        }
    }
    catch (error) {
        console.error('Error sending password reset OTP:', error);
        return res.status(500).json({
            message: 'حدث خطأ في الخادم'
        });
    }
};
exports.sendPasswordResetOTP = sendPasswordResetOTP;
// التحقق من OTP
const verifyOTP = async (req, res) => {
    try {
        const { identifier, code } = req.body;
        if (!identifier || !code) {
            return res.status(400).json({
                message: 'يرجى إدخال المعرف ورمز التحقق'
            });
        }
        const verification = await otp_service_1.otpService.verifyOTP(identifier, code);
        if (verification.valid) {
            return res.json({
                success: true,
                message: verification.message,
                verified: true
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: verification.message,
                verified: false
            });
        }
    }
    catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({
            message: 'حدث خطأ في التحقق من الرمز'
        });
    }
};
exports.verifyOTP = verifyOTP;
// إعادة إرسال OTP
const resendOTP = async (req, res) => {
    try {
        const { identifier, method = 'email', purpose = 'register' } = req.body;
        if (!identifier) {
            return res.status(400).json({
                message: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف'
            });
        }
        let result = null;
        const correctPurpose = purpose === 'reset' ? 'reset-password' : 'register';
        if (method === 'email') {
            result = await otp_service_1.otpService.sendEmailOTP(identifier, correctPurpose);
        }
        else {
            // SMS غير مفعل - استخدم email
            result = await otp_service_1.otpService.sendEmailOTP(identifier, correctPurpose);
        }
        if (result && result.success) {
            return res.json({
                success: true,
                message: 'تم إعادة إرسال رمز التحقق بنجاح'
            });
        }
        else {
            return res.status(500).json({
                success: false,
                message: 'حدث خطأ في إعادة إرسال رمز التحقق'
            });
        }
    }
    catch (error) {
        console.error('Error resending OTP:', error);
        return res.status(500).json({
            message: 'حدث خطأ في الخادم'
        });
    }
};
exports.resendOTP = resendOTP;
//# sourceMappingURL=otp.controller.js.map