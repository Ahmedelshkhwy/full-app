import { Request, Response } from 'express';
import { otpService } from '../services/otp.service';
import User from '../models/user.model';

// إرسال OTP للتسجيل
export const sendRegistrationOTP = async (req: Request, res: Response) => {
  try {
    const { email, phone, method = 'email' } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ 
        message: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف' 
      });
    }

    // التحقق من عدم وجود المستخدم مسبقاً
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'البريد الإلكتروني مُسجل مسبقاً' 
        });
      }
    }

    if (phone) {
      const existingUser = await User.findOne({ phone });
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
      result = await otpService.sendEmailOTP(email, 'register');
      identifier = email;
    } else if (method === 'sms' && phone) {
      // SMS غير مفعل حالياً - استخدم email بدلاً منه
      result = await otpService.sendEmailOTP(email || phone, 'register');
      identifier = email || phone;
    }

    if (result && result.success) {
      return res.json({
        success: true,
        message: `تم إرسال رمز التحقق إلى ${method === 'email' ? 'البريد الإلكتروني' : 'رقم الهاتف'}`,
        identifier: identifier.replace(/(.{3}).*(.{3})/, '$1***$2') // إخفاء جزء من المعرف
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ في إرسال رمز التحقق'
      });
    }

  } catch (error) {
    console.error('Error sending registration OTP:', error);
    return res.status(500).json({ 
      message: 'حدث خطأ في الخادم' 
    });
  }
};

// إرسال OTP لاستعادة كلمة المرور
export const sendPasswordResetOTP = async (req: Request, res: Response) => {
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
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
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
      result = await otpService.sendEmailOTP(user.email, 'reset-password');
      identifier = user.email;
    } else if (method === 'sms' && user.phone) {
      // SMS غير مفعل - استخدم email
      result = await otpService.sendEmailOTP(user.email, 'reset-password');
      identifier = user.email;
    }

    if (result && result.success) {
      return res.json({
        success: true,
        message: `تم إرسال رمز التحقق إلى ${method === 'email' ? 'البريد الإلكتروني' : 'رقم الهاتف'}`,
        identifier: identifier.replace(/(.{3}).*(.{3})/, '$1***$2')
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ في إرسال رمز التحقق'
      });
    }

  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    return res.status(500).json({ 
      message: 'حدث خطأ في الخادم' 
    });
  }
};

// التحقق من OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { identifier, code } = req.body;

    if (!identifier || !code) {
      return res.status(400).json({ 
        message: 'يرجى إدخال المعرف ورمز التحقق' 
      });
    }

    const verification = await otpService.verifyOTP(identifier, code);

    if (verification.valid) {
      return res.json({
        success: true,
        message: verification.message,
        verified: true
      });
    } else {
      return res.status(400).json({
        success: false,
        message: verification.message,
        verified: false
      });
    }

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ 
      message: 'حدث خطأ في التحقق من الرمز' 
    });
  }
};

// إعادة إرسال OTP
export const resendOTP = async (req: Request, res: Response) => {
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
      result = await otpService.sendEmailOTP(identifier, correctPurpose);
    } else {
      // SMS غير مفعل - استخدم email
      result = await otpService.sendEmailOTP(identifier, correctPurpose);
    }

    if (result && result.success) {
      return res.json({
        success: true,
        message: 'تم إعادة إرسال رمز التحقق بنجاح'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ في إعادة إرسال رمز التحقق'
      });
    }

  } catch (error) {
    console.error('Error resending OTP:', error);
    return res.status(500).json({ 
      message: 'حدث خطأ في الخادم' 
    });
  }
};
