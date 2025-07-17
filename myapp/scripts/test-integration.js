#!/usr/bin/env node

/**
 * سكريبت اختبار التكامل بين الفرونت اند والباك اند
 * تشغيل: node scripts/test-integration.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// تكوين API
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// ألوان للطباعة
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

// دالة لاختبار الاتصال بالخادم
async function testServerConnection() {
  try {
    log.info('اختبار الاتصال بالخادم...');
    const response = await axios.get(`${API_BASE_URL}/health`);
    log.success('الخادم يعمل بشكل صحيح');
    log.info(`حالة الخادم: ${JSON.stringify(response.data)}`);
    return true;
  } catch (error) {
    log.error(`فشل الاتصال بالخادم: ${error.message}`);
    return false;
  }
}

// دالة لاختبار تسجيل مستخدم جديد
async function testUserRegistration() {
  try {
    log.info('اختبار تسجيل مستخدم جديد...');
    const userData = {
      name: 'مستخدم تجريبي',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      phone: '+966501234567'
    };
    
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    log.success('تم تسجيل المستخدم بنجاح');
    log.info(`Token: ${response.data.token}`);
    return response.data.token;
  } catch (error) {
    log.error(`فشل تسجيل المستخدم: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// دالة لاختبار تسجيل الدخول
async function testUserLogin() {
  try {
    log.info('اختبار تسجيل الدخول...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    log.success('تم تسجيل الدخول بنجاح');
    log.info(`Token: ${response.data.token}`);
    return response.data.token;
  } catch (error) {
    log.error(`فشل تسجيل الدخول: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// دالة لاختبار جلب المنتجات
async function testGetProducts(token = null) {
  try {
    log.info('اختبار جلب المنتجات...');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(`${API_BASE_URL}/products`, { headers });
    log.success('تم جلب المنتجات بنجاح');
    log.info(`عدد المنتجات: ${response.data.length}`);
    return response.data;
  } catch (error) {
    log.error(`فشل جلب المنتجات: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// دالة لاختبار جلب الفئات
async function testGetCategories(token = null) {
  try {
    log.info('اختبار جلب الفئات...');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(`${API_BASE_URL}/categories`, { headers });
    log.success('تم جلب الفئات بنجاح');
    log.info(`عدد الفئات: ${response.data.length}`);
    return response.data;
  } catch (error) {
    log.error(`فشل جلب الفئات: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// دالة لاختبار إضافة منتج إلى السلة
async function testAddToCart(token, productId) {
  try {
    log.info('اختبار إضافة منتج إلى السلة...');
    const headers = { Authorization: `Bearer ${token}` };
    const cartData = { productId, quantity: 1 };
    
    const response = await axios.post(`${API_BASE_URL}/cart/add`, cartData, { headers });
    log.success('تم إضافة المنتج إلى السلة بنجاح');
    log.info(`إجمالي السلة: ${response.data.totalAmount}`);
    return response.data;
  } catch (error) {
    log.error(`فشل إضافة المنتج إلى السلة: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// دالة لاختبار جلب السلة
async function testGetCart(token) {
  try {
    log.info('اختبار جلب السلة...');
    const headers = { Authorization: `Bearer ${token}` };
    
    const response = await axios.get(`${API_BASE_URL}/cart`, { headers });
    log.success('تم جلب السلة بنجاح');
    log.info(`عدد العناصر: ${response.data.itemCount}`);
    return response.data;
  } catch (error) {
    log.error(`فشل جلب السلة: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// دالة لاختبار إنشاء طلب
async function testCreateOrder(token) {
  try {
    log.info('اختبار إنشاء طلب...');
    const headers = { Authorization: `Bearer ${token}` };
    const orderData = {
      items: [
        {
          productId: '507f1f77bcf86cd799439011',
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
    log.success('تم إنشاء الطلب بنجاح');
    log.info(`رقم الطلب: ${response.data._id}`);
    return response.data;
  } catch (error) {
    log.error(`فشل إنشاء الطلب: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// دالة لاختبار Swagger
async function testSwaggerDocs() {
  try {
    log.info('اختبار وثائق Swagger...');
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api-docs`);
    log.success('وثائق Swagger متاحة');
    return true;
  } catch (error) {
    log.error(`فشل الوصول لوثائق Swagger: ${error.message}`);
    return false;
  }
}

// دالة رئيسية لتنفيذ جميع الاختبارات
async function runAllTests() {
  log.title('🚀 بدء اختبارات التكامل');
  
  const results = {
    serverConnection: false,
    swaggerDocs: false,
    userRegistration: false,
    userLogin: false,
    products: false,
    categories: false,
    cart: false,
    orders: false
  };
  
  // اختبار الاتصال بالخادم
  results.serverConnection = await testServerConnection();
  if (!results.serverConnection) {
    log.error('فشل الاتصال بالخادم. تأكد من تشغيل الباك اند.');
    return results;
  }
  
  // اختبار وثائق Swagger
  results.swaggerDocs = await testSwaggerDocs();
  
  // اختبار تسجيل الدخول
  const token = await testUserLogin();
  if (token) {
    results.userLogin = true;
    
    // اختبار الوظائف التي تتطلب مصادقة
    results.products = !!(await testGetProducts(token));
    results.categories = !!(await testGetCategories(token));
    results.cart = !!(await testGetCart(token));
    
    // اختبار إضافة منتج إلى السلة
    const products = await testGetProducts(token);
    if (products && products.length > 0) {
      await testAddToCart(token, products[0]._id);
      await testGetCart(token);
    }
    
    results.orders = !!(await testCreateOrder(token));
  } else {
    log.warning('فشل تسجيل الدخول. سيتم اختبار الوظائف العامة فقط.');
    
    // اختبار الوظائف العامة
    results.products = !!(await testGetProducts());
    results.categories = !!(await testGetCategories());
  }
  
  // اختبار تسجيل مستخدم جديد
  const newToken = await testUserRegistration();
  if (newToken) {
    results.userRegistration = true;
  }
  
  return results;
}

// دالة لعرض النتائج النهائية
function displayResults(results) {
  log.title('📊 نتائج اختبارات التكامل');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`\n${colors.bright}إجمالي الاختبارات: ${totalTests}`);
  console.log(`الاختبارات الناجحة: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`الاختبارات الفاشلة: ${colors.red}${totalTests - passedTests}${colors.reset}`);
  console.log(`نسبة النجاح: ${colors.cyan}${successRate}%${colors.reset}\n`);
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? `${colors.green}✅${colors.reset}` : `${colors.red}❌${colors.reset}`;
    const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${testName}`);
  });
  
  if (successRate >= 80) {
    log.success('🎉 التكامل يعمل بشكل ممتاز!');
  } else if (successRate >= 60) {
    log.warning('⚠️ التكامل يعمل بشكل مقبول، لكن يحتاج تحسينات.');
  } else {
    log.error('💥 التكامل يحتاج إصلاحات عاجلة!');
  }
}

// تشغيل الاختبارات
async function main() {
  try {
    const results = await runAllTests();
    displayResults(results);
    
    // حفظ النتائج في ملف
    const reportPath = path.join(__dirname, '../test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    log.info(`تم حفظ النتائج في: ${reportPath}`);
    
  } catch (error) {
    log.error(`خطأ في تشغيل الاختبارات: ${error.message}`);
    process.exit(1);
  }
}

// تشغيل السكريبت إذا تم استدعاؤه مباشرة
if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  displayResults,
  testServerConnection,
  testUserLogin,
  testUserRegistration,
  testGetProducts,
  testGetCategories,
  testAddToCart,
  testGetCart,
  testCreateOrder,
  testSwaggerDocs
}; 