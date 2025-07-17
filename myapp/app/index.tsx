// هذا الملف يقوم بتوجيه المستخدم إلى الصفحة الرئيسية
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

// يجب أن نضيف هذا التعليق لمنع expo-router من جعله تاب
// @ts-ignore-next-line
export const unstable_settings = {
  isHidden: false, // هذا يخبر expo-router أن لا يجعل هذا المسار تاب
};

export default function Index() {
  const { token, user } = useAuth();

  useEffect(() => {
    const redirectUser = async () => {
      // انتظار قليل للتأكد من تحميل البيانات
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!token) {
        // المستخدم غير مسجل - توجيه لصفحة تسجيل الدخول
        router.replace('/(auth)/login');
      } else {
        // المستخدم مسجل - توجيه للتبويبات الرئيسية
        router.replace('/(tabs)');
      }
    };

    redirectUser();
  }, [token, user]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#23B6C7" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F3F7',
  },
});

