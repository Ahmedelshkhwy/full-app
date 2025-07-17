import { Router } from 'express';
import {
  sendRegistrationOTP,
  sendPasswordResetOTP,
  verifyOTP,
  resendOTP
} from '../controllers/otp.controller';

const router = Router();

// إرسال OTP للتسجيل
router.post('/send/register', sendRegistrationOTP);

// إرسال OTP لاستعادة كلمة المرور
router.post('/send/reset-password', sendPasswordResetOTP);

// التحقق من OTP
router.post('/verify', verifyOTP);

// إعادة إرسال OTP
router.post('/resend', resendOTP);

export default router;
