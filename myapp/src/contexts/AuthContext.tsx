import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  loginUser,
  registerUser,
  resetPassword,
  sendOTPForRegister,
  sendOTPForResetPassword
} from '../api/api';
import { AuthContextType, OTPVerificationRequest, User, UserRegistrationData } from '../types/modules';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthData = async (newToken: string, newUser: User) => {
    try {
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await loginUser({ email, password });

      if (response.user && response.token) {
        await saveAuthData(response.token, response.user);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'فشل في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: UserRegistrationData) => {
    try {
      setIsLoading(true);
      const response = await registerUser(userData);

      if (response.user && response.token) {
        await saveAuthData(response.token, response.user);
        return { otpId: '' }; // Direct registration doesn't need OTP
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.message || 'فشل في التسجيل');
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (email: string, type: 'register' | 'reset-password') => {
    try {
      setIsLoading(true);

      if (type === 'register') {
        const response = await sendOTPForRegister({ email });
        return { otpId: response.otpId };
      } else {
        const response = await sendOTPForResetPassword(email);
        return { otpId: response.otpId };
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      throw new Error(error.response?.data?.message || 'فشل في إرسال رمز التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (otpId: string, code: string) => {
    try {
      setIsLoading(true);
      const data: OTPVerificationRequest = { otpId, code };
      const response = await verifyOTP(data);

      if (response.token && response.user) {
        await saveAuthData(response.token, response.user);
      } else {
        throw new Error('Invalid OTP verification response');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      throw new Error(error.response?.data?.message || 'فشل في التحقق من الرمز');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordWithOTP = async (otpId: string, code: string, newPassword: string) => {
    try {
      setIsLoading(true);
      const response = await resetPassword({ otpId, code, newPassword });
      return response;
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.response?.data?.message || 'فشل في إعادة تعيين كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
  };

  const value: AuthContextType = {
    token,
    user,
    login,
    register,
    verifyOTP,
    sendOTP,
    resetPassword: resetPasswordWithOTP,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};