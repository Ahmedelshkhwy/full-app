import nodemailer from 'nodemailer';
import crypto from 'crypto';

// خدمة OTP للتطوير والإنتاج
export class OTPService {
  private transporter: nodemailer.Transporter;
  private otpStore = new Map<string, { code: string; expires: Date; attempts: number }>();

  constructor() {
    // إعداد Nodemailer للتطوير (Gmail)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // your-email@gmail.com
        pass: process.env.EMAIL_PASS  // App Password من Google
      }
    });
  }

  // إنشاء OTP
  generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // إرسال OTP للإيميل
  async sendEmailOTP(email: string, purpose: 'register' | 'reset' = 'register'): Promise<boolean> {
    try {
      const otp = this.generateOTP();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق

      // حفظ OTP في الذاكرة (للتطوير) - في الإنتاج استخدم Redis
      this.otpStore.set(email, { code: otp, expires, attempts: 0 });

      // في بيئة التطوير - طباعة الرمز في Console
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 ===============================');
        console.log(`📧 [تطوير] OTP للإيميل: ${email}`);
        console.log(`🔐 الرمز: ${otp}`);
        console.log(`⏰ صالح حتى: ${expires.toLocaleString('ar-SA')}`);
        console.log(`📝 الغرض: ${purpose === 'register' ? 'التسجيل' : 'استعادة كلمة المرور'}`);
        console.log('📧 ===============================');
        return true;
      }

      const subject = purpose === 'register' ? 'رمز تأكيد التسجيل' : 'رمز استعادة كلمة المرور';
      const text = `
🔐 رمز التحقق الخاص بك: ${otp}

⏰ صالح لمدة 10 دقائق فقط
🚫 لا تشارك هذا الرمز مع أحد

صيدليات الشافي
      `;

      await this.transporter.sendMail({
        from: `"صيدليات الشافي" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: text,
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
            <h2 style="color: #2196F3;">🏥 صيدليات الشافي</h2>
            <p>مرحباً بك،</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333;">🔐 رمز التحقق الخاص بك:</h3>
              <h1 style="color: #2196F3; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>⏰ <strong>مهم:</strong> هذا الرمز صالح لمدة 10 دقائق فقط</p>
            <p>🚫 لا تشارك هذا الرمز مع أحد لأسباب أمنية</p>
            <hr>
            <p style="color: #666; font-size: 12px;">إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة</p>
          </div>
        `
      });

      console.log(`✅ تم إرسال OTP للإيميل: ${email} | الرمز: ${otp}`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في إرسال OTP:', error);
      return false;
    }
  }

  // إرسال OTP للهاتف (Twilio للتطوير)
  async sendSMSOTP(phone: string, purpose: 'register' | 'reset' = 'register'): Promise<boolean> {
    try {
      // في بيئة التطوير - طباعة الرمز في Console
      if (process.env.NODE_ENV === 'development') {
        const otp = this.generateOTP();
        const expires = new Date(Date.now() + 10 * 60 * 1000);
        
        this.otpStore.set(phone, { code: otp, expires, attempts: 0 });
        
        console.log(`📱 [تطوير] OTP للهاتف ${phone}: ${otp}`);
        console.log(`⏰ صالح حتى: ${expires.toLocaleString('ar-SA')}`);
        return true;
      }

      // في الإنتاج - استخدام Twilio (يحتاج إعداد)
      // const twilio = require('twilio');
      // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      // await client.messages.create({...});

      return false;
    } catch (error) {
      console.error('❌ خطأ في إرسال SMS OTP:', error);
      return false;
    }
  }

  // التحقق من OTP
  verifyOTP(identifier: string, inputCode: string): { valid: boolean; message: string } {
    const otpData = this.otpStore.get(identifier);
    
    if (!otpData) {
      return { valid: false, message: 'لم يتم إرسال رمز تحقق لهذا العنوان' };
    }

    if (new Date() > otpData.expires) {
      this.otpStore.delete(identifier);
      return { valid: false, message: 'انتهت صلاحية رمز التحقق' };
    }

    if (otpData.attempts >= 3) {
      this.otpStore.delete(identifier);
      return { valid: false, message: 'تم تجاوز عدد المحاولات المسموحة' };
    }

    if (otpData.code !== inputCode) {
      otpData.attempts++;
      return { valid: false, message: 'رمز التحقق غير صحيح' };
    }

    // رمز صحيح
    this.otpStore.delete(identifier);
    return { valid: true, message: 'تم التحقق بنجاح' };
  }

  // مسح الرموز المنتهية الصلاحية (تنظيف دوري)
  cleanup(): void {
    const now = new Date();
    for (const [key, value] of this.otpStore.entries()) {
      if (now > value.expires) {
        this.otpStore.delete(key);
      }
    }
  }
}

// إنشاء instance واحد
export const otpService = new OTPService();

// تنظيف دوري كل 5 دقائق
setInterval(() => otpService.cleanup(), 5 * 60 * 1000);
