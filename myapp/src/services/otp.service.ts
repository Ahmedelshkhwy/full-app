import apiClient from '../config/axios';
import { 
  OTPSendRequest, 
  OTPResponse, 
  OTPVerificationRequest, 
  OTPVerificationResponse,
  UserRegistrationData 
} from '../types/modules';

/**
 * خدمة OTP - إرسال وتحقق من رموز OTP
 */
export class OTPService {
  
  /**
   * إرسال رمز OTP للتسجيل مع بيانات المستخدم
   */
  static async sendRegistrationOTPWithUserData(userData: UserRegistrationData): Promise<{ otpId: string; message: string }> {
    try {
      console.log('🚀 Sending registration OTP with user data:', userData.email);
      
      const response = await apiClient.post<OTPResponse>('/otp/send/register', {
        email: userData.email,
        phone: userData.phone,
        type: 'register',
        userData: userData // إرسال بيانات المستخدم مؤقتاً
      });

      console.log('✅ Registration OTP sent successfully');
      return {
        otpId: response.data.otpId || '',
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Error sending registration OTP:', error);
      throw new Error(error.response?.data?.message || 'فشل في إرسال رمز التحقق');
    }
  }
  
  /**
   * إرسال رمز OTP للتسجيل
   */
  static async sendRegistrationOTP(email: string, phone?: string): Promise<{ otpId: string; message: string }> {
    try {
      console.log('🚀 Sending registration OTP to:', email);
      
      const response = await apiClient.post<OTPResponse>('/otp/send/register', {
        email,
        phone,
        type: 'register'
      } as OTPSendRequest);

      console.log('✅ Registration OTP sent successfully');
      return {
        otpId: response.data.otpId || '',
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Error sending registration OTP:', error);
      throw new Error(error.response?.data?.message || 'فشل في إرسال رمز التحقق');
    }
  }

  /**
   * إرسال رمز OTP لاستعادة كلمة المرور
   */
  static async sendPasswordResetOTP(email: string): Promise<{ otpId: string; message: string }> {
    try {
      console.log('🚀 Sending password reset OTP to:', email);
      
      const response = await apiClient.post<OTPResponse>('/otp/send/reset-password', {
        email,
        type: 'reset-password'
      } as OTPSendRequest);

      console.log('✅ Password reset OTP sent successfully');
      return {
        otpId: response.data.otpId || '',
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Error sending password reset OTP:', error);
      throw new Error(error.response?.data?.message || 'فشل في إرسال رمز استعادة كلمة المرور');
    }
  }

  /**
   * التحقق من رمز OTP
   */
  static async verifyOTP(otpId: string, code: string): Promise<OTPVerificationResponse> {
    try {
      console.log('🚀 Verifying OTP:', { otpId, code });
      
      const response = await apiClient.post<OTPVerificationResponse>('/otp/verify', {
        otpId,
        code
      } as OTPVerificationRequest);

      console.log('✅ OTP verified successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error verifying OTP:', error);
      throw new Error(error.response?.data?.message || 'رمز التحقق غير صحيح');
    }
  }

  /**
   * إعادة إرسال رمز OTP
   */
  static async resendOTP(otpId: string): Promise<{ message: string }> {
    try {
      console.log('🚀 Resending OTP for ID:', otpId);
      
      const response = await apiClient.post<OTPResponse>('/otp/resend', {
        otpId
      });

      console.log('✅ OTP resent successfully');
      return {
        message: response.data.message
      };
    } catch (error: any) {
      console.error('❌ Error resending OTP:', error);
      throw new Error(error.response?.data?.message || 'فشل في إعادة إرسال رمز التحقق');
    }
  }

  /**
   * إعادة تعيين كلمة المرور باستخدام OTP
   */
  static async resetPasswordWithOTP(
    otpId: string, 
    code: string, 
    newPassword: string
  ): Promise<{ message: string }> {
    try {
      console.log('🚀 Resetting password with OTP');
      
      const response = await apiClient.post('/auth/reset-password', {
        otpId,
        code,
        newPassword
      });

      console.log('✅ Password reset successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error resetting password:', error);
      throw new Error(error.response?.data?.message || 'فشل في إعادة تعيين كلمة المرور');
    }
  }
}
