import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/user.model';

// تحميل متغيرات البيئة
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAccountant = async () => {
  try {
    // الاتصال بقاعدة البيانات
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy';
    await mongoose.connect(mongoUri);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // بيانات المحاسب
    const accountantData = {
      username: 'accountant',
      email: 'accountant@pharmacy.com',
      password: 'accountant123',
      phone: '0501234567',
      role: 'accountant',
      address: 'قسم المحاسبة - صيدليات الشافي',
      isVerified: true
    };

    // التحقق من وجود المحاسب
    const existingAccountant = await User.findOne({ 
      $or: [
        { username: accountantData.username },
        { email: accountantData.email },
        { role: 'accountant' }
      ]
    });

    if (existingAccountant) {
      console.log('⚠️ يوجد مستخدم محاسب بالفعل:', existingAccountant.username);
      console.log('📧 البريد الإلكتروني:', existingAccountant.email);
      console.log('🔑 الدور:', existingAccountant.role);
      return;
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(accountantData.password, 10);

    // إنشاء المحاسب
    const accountant = new User({
      ...accountantData,
      password: hashedPassword,
      lastLogin: new Date()
    });

    await accountant.save();

    console.log('🎉 تم إنشاء مستخدم المحاسبة بنجاح!');
    console.log('📊 بيانات تسجيل الدخول:');
    console.log('👤 اسم المستخدم:', accountantData.username);
    console.log('📧 البريد الإلكتروني:', accountantData.email);
    console.log('🔒 كلمة المرور:', accountantData.password);
    console.log('🔑 الدور:', accountantData.role);
    console.log('');
    console.log('🔗 يمكن الوصول لتقارير المحاسبة عبر:');
    console.log('📊 /api/accounting/dashboard');
    console.log('📈 /api/accounting/sales/stats');
    console.log('💰 /api/accounting/profit-loss');

  } catch (error) {
    console.error('❌ خطأ في إنشاء المحاسب:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ تم قطع الاتصال بقاعدة البيانات');
  }
};

// تشغيل السكريبت
createAccountant();
