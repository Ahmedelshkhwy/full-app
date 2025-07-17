import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import OTPInput from '../../src/components/OTPInput';
import OTPTimer from '../../src/components/OTPTimer';
import { OTPService } from '../../src/services/otp.service';
import { useAuth } from '../../src/contexts/AuthContext';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    otpId: string;
    email: string;
    type: 'register' | 'reset-password';
  }>();
  
  const { verifyOTP } = useAuth();
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleOTPComplete = async (otpCode: string) => {
    if (!params.otpId) {
      Alert.alert('خطأ', 'معرف OTP مفقود');
      return;
    }

    setIsLoading(true);
    try {
      if (params.type === 'register') {
        // التحقق من OTP للتسجيل
        await verifyOTP(params.otpId, otpCode);
        Alert.alert('نجح!', 'تم التحقق من الحساب بنجاح', [
          {
            text: 'موافق',
            onPress: () => router.replace('/' as any)
          }
        ]);
      } else if (params.type === 'reset-password') {
        // التحقق من OTP لإعادة تعيين كلمة المرور
        const result = await OTPService.verifyOTP(params.otpId, otpCode);
        Alert.alert('نجح!', 'تم التحقق من الرمز بنجاح', [
          {
            text: 'متابعة',
            onPress: () => router.push({
              pathname: '/(auth)/reset-password',
              params: { otpId: params.otpId, code: otpCode }
            })
          }
        ]);
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      Alert.alert('خطأ', error.message || 'فشل في التحقق من الرمز');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!params.otpId) {
      Alert.alert('خطأ', 'معرف OTP مفقود');
      return;
    }

    setIsResending(true);
    try {
      await OTPService.resendOTP(params.otpId);
      Alert.alert('تم!', 'تم إعادة إرسال رمز التحقق بنجاح');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      Alert.alert('خطأ', error.message || 'فشل في إعادة إرسال الرمز');
    } finally {
      setIsResending(false);
    }
  };

  const getTitle = () => {
    return params.type === 'register' ? 'تأكيد الحساب' : 'استعادة كلمة المرور';
  };

  const getDescription = () => {
    return `تم إرسال رمز التحقق إلى ${params.email}. يرجى إدخال الرمز المكون من 6 أرقام.`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <View style={styles.spacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="security" size={60} color="#007AFF" />
          </View>

          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.description}>{getDescription()}</Text>

          <View style={styles.otpContainer}>
            <OTPInput
              length={6}
              onComplete={handleOTPComplete}
              onChangeText={setOtp}
              disabled={isLoading}
            />
          </View>

          <OTPTimer
            onResend={handleResendOTP}
            disabled={isResending}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>جاري التحقق من الرمز...</Text>
            </View>
          )}

          {isResending && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.loadingText}>جاري إعادة الإرسال...</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            لم تتلق الرمز؟ تحقق من مجلد الرسائل غير المرغوب فيها
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  spacer: {
    width: 34, // نفس عرض زر الرجوع
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  otpContainer: {
    marginBottom: 30,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
