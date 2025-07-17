"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordWithOTP = exports.login = exports.register = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
// Register controller
const register = async (req, res) => {
    try {
        const { username, email, password, phone, address, location, role } = req.body;
        const existingUser = await user_model_1.default.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await user_model_1.default.create({
            username,
            email,
            password: hashedPassword,
            phone,
            address,
            location,
            role
        });
        user.lastLogin = new Date();
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username, role: user.role }, process.env['JWT_SECRET'], { expiresIn: '7d' });
        return res.status(201).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            token
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: 'حدث خطأ أثناء التسجيل' });
    }
};
exports.register = register;
// Login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_model_1.default.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username, role: user.role }, process.env['JWT_SECRET'], { expiresIn: '7d' });
        console.log(token);
        return res.json({ user, token });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول' });
    }
};
exports.login = login;
// Reset Password with OTP
const resetPasswordWithOTP = async (req, res) => {
    try {
        const { otpId, code, newPassword } = req.body;
        if (!otpId || !code || !newPassword) {
            return res.status(400).json({
                message: 'جميع الحقول مطلوبة'
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
            });
        }
        // التحقق من OTP أولاً
        const { otpService } = await Promise.resolve().then(() => __importStar(require('../services/otp.service')));
        const verification = await otpService.verifyOTP(otpId, code);
        if (!verification.valid) {
            return res.status(400).json({
                message: verification.message || 'رمز التحقق غير صحيح'
            });
        }
        if (verification.purpose !== 'reset-password') {
            return res.status(400).json({
                message: 'رمز التحقق غير صالح لإعادة تعيين كلمة المرور'
            });
        }
        // البحث عن المستخدم وتحديث كلمة المرور
        if (!verification.userData || !verification.userData.email) {
            return res.status(400).json({
                message: 'بيانات المستخدم غير متوفرة'
            });
        }
        const user = await user_model_1.default.findOne({ email: verification.userData.email });
        if (!user) {
            return res.status(404).json({
                message: 'المستخدم غير موجود'
            });
        }
        // تحديث كلمة المرور
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return res.json({
            message: 'تم إعادة تعيين كلمة المرور بنجاح'
        });
    }
    catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' });
    }
};
exports.resetPasswordWithOTP = resetPasswordWithOTP;
//# sourceMappingURL=auth.controller.js.map