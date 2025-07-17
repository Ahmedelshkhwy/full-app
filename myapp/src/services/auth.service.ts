import apiClient from '../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

// تسجيل الدخول
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', data);
  
  // حفظ البيانات محلياً
  await AsyncStorage.setItem('authToken', response.data.token);
  await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
  await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
  
  return response.data;
};

// تسجيل مستخدم جديد
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', data);
  
  // حفظ البيانات محلياً
  await AsyncStorage.setItem('authToken', response.data.token);
  await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
  await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
  
  return response.data;
};

// تسجيل الخروج
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // حذف البيانات المحلية
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
  }
};

// التحقق من حالة المصادقة
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {return false;}
    
    // يمكن إضافة طلب للتحقق من صحة token
    return true;
  } catch (error) {
    return false;
  }
};

// الحصول على بيانات المستخدم المحفوظة
export const getStoredUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};