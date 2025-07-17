// ملف اختبار التكامل بين الباك اند والفرونت اند
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// دالة لاختبار الاتصال بالخادم
async function testServerConnection() {
  try {
    console.log('🔍 اختبار الاتصال بالخادم...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ الخادم يعمل بشكل صحيح');
    console.log('📊 حالة الخادم:', response.data);
    return true;
  } catch (error) {
    console.error('❌ فشل الاتصال بالخادم:', error.message);
    return false;
  }
}

// دالة لاختبار تسجيل مستخدم جديد
async function testUserRegistration() {
  try {
    console.log('\n🔍 اختبار تسجيل مستخدم جديد...');
    const userData = {
      name: 'مستخدم تجريبي',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      phone: '+966501234567'
    };
    
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    console.log('✅ تم تسجيل المستخدم بنجاح');
    console.log('👤 بيانات المستخدم:', response.data.user);
    return response.data.token;
  } catch (error) {
    console.error('❌ فشل تسجيل المستخدم:', error.response?.data?.message || error.message);
    return null;
  }
}

// دالة لاختبار تسجيل الدخول
async function testUserLogin() {
  try {
    console.log('\n🔍 اختبار تسجيل الدخول...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log('🔑 Token:', response.data.token);
    return response.data.token;
  } catch (error) {
    console.error('❌ فشل تسجيل الدخول:', error.response?.data?.message || error.message);
    return null;
  }
}

// دالة لاختبار جلب المنتجات
async function testGetProducts(token = null) {
  try {
    console.log('\n🔍 اختبار جلب المنتجات...');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(`${API_BASE_URL}/products`, { headers });
    console.log('✅ تم جلب المنتجات بنجاح');
    console.log(`📦 عدد المنتجات: ${response.data.length}`);
    return response.data;
  } catch (error) {
    console.error('❌ فشل جلب المنتجات:', error.response?.data?.message || error.message);
    return null;
  }
}

// دالة لاختبار جلب الفئات
async function testGetCategories(token = null) {
  try {
    console.log('\n🔍 اختبار جلب الفئات...');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(`${API_BASE_URL}/categories`, { headers });
    console.log('✅ تم جلب الفئات بنجاح');
    console.log(`📂 عدد الفئات: ${response.data.length}`);
    return response.data;
  } catch (error) {
    console.error('❌ فشل جلب الفئات:', error.response?.data?.message || error.message);
    return null;
  }
}

// دالة لاختبار إضافة منتج إلى السلة
async function testAddToCart(token, productId) {
  try {
    console.log('\n🔍 اختبار إضافة منتج إلى السلة...');
    const headers = { Authorization: `Bearer ${token}` };
    const cartData = { productId, quantity: 1 };
    
    const response = await axios.post(`${API_BASE_URL}/cart/add`, cartData, { headers });
    console.log('✅ تم إضافة المنتج إلى السلة بنجاح');
    console.log('🛒 بيانات السلة:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ فشل إضافة المنتج إلى السلة:', error.response?.data?.message || error.message);
    return null;
  }
}

// دالة لاختبار جلب السلة
async function testGetCart(token) {
  try {
    console.log('\n🔍 اختبار جلب السلة...');
    const headers = { Authorization: `Bearer ${token}` };
    
    const response = await axios.get(`${API_BASE_URL}/cart`, { headers });
    console.log('✅ تم جلب السلة بنجاح');
    console.log('🛒 محتويات السلة:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ فشل جلب السلة:', error.response?.data?.message || error.message);
    return null;
  }
}

// دالة لاختبار إنشاء طلب
async function testCreateOrder(token) {
  try {
    console.log('\n🔍 اختبار إنشاء طلب...');
    const headers = { Authorization: `Bearer ${token}` };
    const orderData = {
      items: [
        {
          productId: '507f1f77bcf86cd799439011', // ID تجريبي
          quantity: 1,
          price: 100
        }
      ],
      shippingAddress: {
        street: 'شارع الملك فهد',
        city: 'الرياض',
        state: 'الرياض',
        zipCode: '12345',
        country: 'السعودية'
      },
      paymentMethod: 'credit_card',
      totalAmount: 100
    };
    
    const response = await axios.post(`${API_BASE_URL}/orders`, orderData, { headers });
    console.log('✅ تم إنشاء الطلب بنجاح');
    console.log('📋 بيانات الطلب:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ فشل إنشاء الطلب:', error.response?.data?.message || error.message);
    return null;
  }
}

// دالة رئيسية لتنفيذ جميع الاختبارات
async function runAllTests() {
  console.log('🚀 بدء اختبارات التكامل...\n');
  
  // اختبار الاتصال بالخادم
  const serverConnected = await testServerConnection();
  if (!serverConnected) {
    console.log('\n❌ فشل الاتصال بالخادم. تأكد من تشغيل الباك اند.');
    return;
  }
  
  // اختبار تسجيل الدخول
  const token = await testUserLogin();
  if (!token) {
    console.log('\n⚠️ فشل تسجيل الدخول. سيتم اختبار الوظائف العامة فقط.');
  }
  
  // اختبار الوظائف العامة
  await testGetProducts();
  await testGetCategories();
  
  // اختبار الوظائف التي تتطلب مصادقة
  if (token) {
    await testGetProducts(token);
    await testGetCategories(token);
    await testGetCart(token);
    
    // اختبار إضافة منتج إلى السلة (إذا كان هناك منتجات)
    const products = await testGetProducts(token);
    if (products && products.length > 0) {
      await testAddToCart(token, products[0]._id);
      await testGetCart(token);
    }
    
    // اختبار إنشاء طلب
    await testCreateOrder(token);
  }
  
  console.log('\n✅ انتهت جميع اختبارات التكامل!');
}

// تشغيل الاختبارات إذا تم استدعاء الملف مباشرة
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testServerConnection,
  testUserRegistration,
  testUserLogin,
  testGetProducts,
  testGetCategories,
  testAddToCart,
  testGetCart,
  testCreateOrder,
  runAllTests
}; 