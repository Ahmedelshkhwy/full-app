// تكوين الفرونت اند للتواصل مع الباك اند
const API_CONFIG = {
  // عنوان الباك اند
  BASE_URL: process.env.REACT_APP_API_URL || 'http://192.168.8.103:5000/api',
  
  // نقاط النهاية (Endpoints)
  ENDPOINTS: {
    // المصادقة
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
    },
    
    // المنتجات
    PRODUCTS: {
      LIST: '/products',
      DETAIL: (id) => `/products/${id}`,
      SEARCH: '/products/search',
      CATEGORY: (categoryId) => `/products/category/${categoryId}`,
    },
    
    // الفئات
    CATEGORIES: {
      LIST: '/categories',
      DETAIL: (id) => `/categories/${id}`,
    },
    
    // السلة
    CART: {
      GET: '/cart',
      ADD: '/cart/add',
      UPDATE: '/cart/update',
      REMOVE: '/cart/remove',
      CLEAR: '/cart/clear',
    },
    
    // الطلبات
    ORDERS: {
      LIST: '/orders',
      CREATE: '/orders',
      DETAIL: (id) => `/orders/${id}`,
      UPDATE: (id) => `/orders/${id}`,
      CANCEL: (id) => `/orders/${id}/cancel`,
    },
    
    // المستخدم
    USER: {
      PROFILE: '/user/profile',
      UPDATE: '/user/profile',
      ADDRESSES: '/user/addresses',
      ORDERS: '/user/orders',
    },
    
    // الدفع
    PAYMENT: {
      CREATE: '/payment/create',
      VERIFY: '/payment/verify',
      METHODS: '/payment/methods',
    },
  },
  
  // إعدادات الطلبات
  REQUEST_CONFIG: {
    TIMEOUT: 10000, // 10 ثواني
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 ثانية
  },
  
  // رسائل الخطأ
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'خطأ في الاتصال بالخادم',
    UNAUTHORIZED: 'غير مصرح لك بالوصول',
    FORBIDDEN: 'ممنوع الوصول',
    NOT_FOUND: 'المورد غير موجود',
    SERVER_ERROR: 'خطأ في الخادم',
    VALIDATION_ERROR: 'بيانات غير صحيحة',
  },
};

// دالة لإنشاء URL كامل
export const createApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// دالة لمعالجة الأخطاء
export const handleApiError = (error) => {
  if (error.response) {
    // الخادم استجاب مع رمز حالة خطأ
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { message: data.message || API_CONFIG.ERROR_MESSAGES.VALIDATION_ERROR };
      case 401:
        return { message: API_CONFIG.ERROR_MESSAGES.UNAUTHORIZED };
      case 403:
        return { message: API_CONFIG.ERROR_MESSAGES.FORBIDDEN };
      case 404:
        return { message: API_CONFIG.ERROR_MESSAGES.NOT_FOUND };
      case 500:
        return { message: API_CONFIG.ERROR_MESSAGES.SERVER_ERROR };
      default:
        return { message: data.message || 'حدث خطأ غير متوقع' };
    }
  } else if (error.request) {
    // تم إرسال الطلب ولكن لم يتم استلام استجابة
    return { message: API_CONFIG.ERROR_MESSAGES.NETWORK_ERROR };
  } else {
    // حدث خطأ في إعداد الطلب
    return { message: 'خطأ في إعداد الطلب' };
  }
};

// دالة للحصول على token من localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// دالة لحفظ token في localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

// دالة لحذف token من localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

// دالة للتحقق من وجود token
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export default API_CONFIG; 