const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pharmacy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  phone: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'ahmedelshkhwy@gmail.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Role: ${existingAdmin.role}`);
      return;
    }

    // Create admin user with provided credentials
    const hashedPassword = await bcrypt.hash('LMred$$22332233', 10);
    const admin = new User({
      username: 'ahmed',
      email: 'ahmedelshkhwy@gmail.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+966501234567'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: ahmedelshkhwy@gmail.com');
    console.log('👤 Username: ahmed');
    console.log('🔑 Password: LMred$$22332233');
    console.log('🔐 Role: admin');
    console.log('');
    console.log('🎉 يمكنك الآن تسجيل الدخول إلى لوحة التحكم!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin(); 