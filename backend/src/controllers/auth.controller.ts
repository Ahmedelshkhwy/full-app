import * as bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// Register controller
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, email, password, phone, address, location, role } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
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

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env['JWT_SECRET'] as string,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: 'حدث خطأ أثناء التسجيل' });
  }
};

// Login controller
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env['JWT_SECRET'] as string,
      { expiresIn: '7d' }
    );
    console.log(token);
    return res.json({ user, token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول' });
  }
};

// Reset Password with OTP
export const resetPasswordWithOTP = async (req: Request, res: Response): Promise<Response> => {
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
    const { otpService } = await import('../services/otp.service');
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

    const user = await User.findOne({ email: verification.userData.email });
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

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' });
  }
};