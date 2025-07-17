"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const otp_controller_1 = require("../controllers/otp.controller");
const router = (0, express_1.Router)();
// إرسال OTP للتسجيل
router.post('/send/register', otp_controller_1.sendRegistrationOTP);
// إرسال OTP لاستعادة كلمة المرور
router.post('/send/reset-password', otp_controller_1.sendPasswordResetOTP);
// التحقق من OTP
router.post('/verify', otp_controller_1.verifyOTP);
// إعادة إرسال OTP
router.post('/resend', otp_controller_1.resendOTP);
exports.default = router;
//# sourceMappingURL=otp.routes.js.map