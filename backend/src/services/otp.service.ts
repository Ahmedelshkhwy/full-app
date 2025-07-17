import nodemailer from 'nodemailer';
import crypto from 'crypto';

interface OTPData {
  code: string;
  expires: Date;
  attempts: number;
  purpose: 'register' | 'reset-password';
  userData?: any;
}

interface OTPResult {
  success: boolean;
  otpId: string;
  message?: string;
}

interface OTPVerificationResult {
  valid: boolean;
  message: string;
  purpose?: string;
  userData?: any;
}

// خدمة OTP للتطوير والإنتاج
export class OTPService {
  private transporter: nodemailer.Transporter;
  private otpStore = new Map<string, OTPData>();

  constructor() {
    // إعداد Nodemailer للتطوير (Gmail)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env['EMAIL_USER'], // your-email@gmail.com
        pass: process.env['EMAIL_PASS']  // App Password من Google
      }
    });
  }

  // إنشاء OTP
  generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // إنشاء معرف فريد للـ OTP
  generateOTPId(): string {
    return crypto.randomUUID();
  }

  // إرسال OTP للإيميل
  async sendEmailOTP(
    email: string, 
    purpose: 'register' | 'reset-password' = 'register',
    userData?: any
  ): Promise<OTPResult> {
    try {
      const otp = this.generateOTP();
      const otpId = this.generateOTPId();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق

      // حفظ OTP في الذاكرة (للتطوير) - في الإنتاج استخدم Redis
      this.otpStore.set(otpId, { 
        code: otp, 
        expires, 
        attempts: 0, 
        purpose,
        userData: userData || (purpose === 'reset-password' ? { email } : undefined)
      });

      // في بيئة التطوير - طباعة الرمز في Console
      if (process.env['NODE_ENV'] === 'development') {
        console.log('📧 ===============================');
        console.log(`📧 [تطوير] OTP للإيميل: ${email}`);
        console.log(`🆔 معرف OTP: ${otpId}`);
        console.log(`🔐 الرمز: ${otp}`);
        console.log(`⏰ صالح حتى: ${expires.toLocaleString('ar-SA')}`);
        console.log(`📝 الغرض: ${purpose === 'register' ? 'التسجيل' : 'استعادة كلمة المرور'}`);
        console.log('📧 ===============================');
        return { success: true, otpId };
      }

      const subject = purpose === 'register' ? 'رمز تأكيد التسجيل' : 'رمز استعادة كلمة المرور';
      const text = `
🔐 رمز التحقق الخاص بك: ${otp}

⏰ صالح لمدة 10 دقائق فقط
🚫 لا تشارك هذا الرمز مع أحد

📱 صيدليات الشافي
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
          <h2 style="color: #2c5aa0; text-align: center;">صيدليات الشافي</h2>
          <div style="background-color: #f8f9fa; border-radius: 10px; padding: 30px; text-align: center;">
            <h3 style="color: #343a40; margin-bottom: 20px;">${subject}</h3>
            <div style="background-color: #007bff; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; margin: 20px 0; letter-spacing: 5px;">
              ${otp}
            </div>
            <p style="color: #6c757d; margin: 20px 0;">⏰ صالح لمدة 10 دقائق فقط</p>
            <p style="color: #dc3545; font-weight: bold;">🚫 لا تشارك هذا الرمز مع أحد</p>
          </div>
          <p style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px;">
            إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: `"صيدليات الشافي" <${process.env['EMAIL_USER']}>`,
        to: email,
        subject,
        text,
        html
      });

      return { success: true, otpId };

    } catch (error) {
      console.error('Error sending OTP email:', error);
      return { success: false, otpId: '', message: 'فشل في إرسال البريد الإلكتروني' };
    }
  }

  // التحقق من OTP
  async verifyOTP(otpId: string, code: string): Promise<OTPVerificationResult> {
    try {
      const otpData = this.otpStore.get(otpId);

      if (!otpData) {
        return { valid: false, message: 'رمز التحقق غير موجود أو منتهي الصلاحية' };
      }

      // فحص انتهاء الصلاحية
      if (new Date() > otpData.expires) {
        this.otpStore.delete(otpId);
        return { valid: false, message: 'رمز التحقق منتهي الصلاحية' };
      }

      // فحص عدد المحاولات
      if (otpData.attempts >= 3) {
        this.otpStore.delete(otpId);
        return { valid: false, message: 'تم تجاوز عدد المحاولات المسموحة' };
      }

      // فحص الرمز
      if (otpData.code !== code) {
        otpData.attempts++;
        return { valid: false, message: 'رمز التحقق غير صحيح' };
      }

      // نجح التحقق
      const result = {
        valid: true,
        message: 'تم التحقق بنجاح',
        purpose: otpData.purpose,
        userData: otpData.userData
      };

      // حذف OTP بعد الاستخدام
      this.otpStore.delete(otpId);

      return result;

    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { valid: false, message: 'حدث خطأ في التحقق من الرمز' };
    }
  }

  // إعادة إرسال OTP
  async resendOTP(otpId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const otpData = this.otpStore.get(otpId);

      if (!otpData) {
        return { success: false, message: 'رمز التحقق غير موجود' };
      }

      // فحص إذا تم الوصول للحد الأقصى لإعادة الإرسال
      if (otpData.attempts >= 3) {
        return { success: false, message: 'تم الوصول للحد الأقصى لإعادة الإرسال' };
      }

      // إنشاء رمز جديد
      const newOtp = this.generateOTP();
      const newExpires = new Date(Date.now() + 10 * 60 * 1000);

      // تحديث البيانات
      this.otpStore.set(otpId, {
        ...otpData,
        code: newOtp,
        expires: newExpires,
        attempts: 0
      });

      // في وضع التطوير
      if (process.env['NODE_ENV'] === 'development') {
        console.log('📧 ===============================');
        console.log(`📧 [إعادة إرسال] OTP ID: ${otpId}`);
        console.log(`🔐 الرمز الجديد: ${newOtp}`);
        console.log(`⏰ صالح حتى: ${newExpires.toLocaleString('ar-SA')}`);
        console.log('📧 ===============================');
      }

      return { success: true, message: 'تم إعادة إرسال الرمز بنجاح' };

    } catch (error) {
      console.error('Error resending OTP:', error);
      return { success: false, message: 'حدث خطأ في إعادة الإرسال' };
    }
  }

  // تنظيف الرموز المنتهية الصلاحية (تشغيل دوري)
  cleanup() {
    const now = new Date();
    for (const [otpId, data] of this.otpStore.entries()) {
      if (now > data.expires) {
        this.otpStore.delete(otpId);
      }
    }
  }
}

// إنشاء instance واحد للخدمة
export const otpService = new OTPService();

// تنظيف دوري كل 5 دقائق
setInterval(() => {
  otpService.cleanup();
}, 5 * 60 * 1000);
