const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy');
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // تعريف نموذج المستخدم مباشرة
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, trim: true },
      password: { type: String, required: true },
      phone: { type: String, required: true },
      role: { type: String, enum: ['user', 'admin', 'pharmacist', 'delivery'], default: 'user' },
      address: { type: String },
      location: {
        lat: { type: Number },
        lng: { type: Number }
      }
    }, {
      timestamps: true
    });

    const User = mongoose.model('User', userSchema);

    // التحقق من وجود مستخدم admin
    const existingAdmin = await User.findOne({ email: 'ahmedelshkhwy@gmail.com' });
    if (existingAdmin) {
      console.log('⚠️  يوجد مستخدم admin بالفعل:', existingAdmin.email);
      return;
    }

    // إنشاء كلمة مرور مشفرة
    const hashedPassword = await bcrypt.hash('LMred$$22332233', 12);

    // إنشاء مستخدم admin
    const adminUser = new User({
      username: 'Admin',
      email: 'ahmedelshkhwy@gmail.com',
      password: hashedPassword,
      phone: '0500000000',
      role: 'admin',
      address: 'عنوان المسؤول',
      location: {
        lat: 24.774265,
        lng: 46.738586
      }
    });

    await adminUser.save();
    console.log('✅ تم إنشاء مستخدم admin بنجاح');
    console.log('📧 البريد الإلكتروني: ahmedelshkhwy@gmail.com');
    console.log('🔑 كلمة المرور: LMred$$22332233');
    console.log('⚠️  يرجى تغيير كلمة المرور بعد تسجيل الدخول');

  } catch (error) {
    console.error('❌ خطأ في إنشاء مستخدم admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
};

// تشغيل السكريبت
createAdminUser(); 