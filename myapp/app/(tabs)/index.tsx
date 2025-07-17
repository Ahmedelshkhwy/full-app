import { useEffect } from 'react';
import { router } from 'expo-router';

export default function TabsIndex() {
  useEffect(() => {
    // توجيه تلقائي للصفحة الرئيسية
    router.replace('/(tabs)/home');
  }, []);

  return null;
} 