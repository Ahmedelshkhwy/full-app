import axios from 'axios';

const API_BASE = 'http://192.168.8.103:5000/api/auth';
// مثال: دالة تسجيل مستخدم جديد (يمكنك تعديل الحقول حسب الحاجة)
export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  location?: { lat: number; lng: number };
  role?: string;
}) => {
  const response = await axios.post(`${API_BASE}/register`, data);
  return response.data;
};

// مثال: دالة تسجيل الدخول
export const loginUser = async (username: string, password: string) => {
  const response = await axios.post(`${API_BASE}/login`, { username, password });
  return response.data; // يجب أن يرجع { user, token }
};

// يمكنك إضافة دوال أخرى حسب الحاجة (تحديث بيانات، حذف مستخدم، إلخ)