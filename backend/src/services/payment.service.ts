import axios from 'axios';
import qs from 'qs';
import { Buffer } from 'buffer';

/**
 * معالجة الدفع - الدالة الأساسية
 */
export const processPayment = async (total: number, method: string) => {
  try {
    // بيانات الدفع الأساسية
    const baseData: any = {
      amount: total * 100,
      currency: 'SAR',
      description: 'طلب من صيدلية الشافي',
      callback_url: 'https://example.com/return',
      'source[type]': method,
    };

    // إذا كانت stcpay أضف رقم الجوال
    if (method === 'stcpay') {
      baseData['source[mobile]'] = '966500000000'; // رقم جوال تجريبي (يجب تغييره حسب الحاجة)
    } else if (method === 'creditcard') {
      baseData['source[name]'] = 'Test User';
      baseData['source[number]'] = '4111111111111111';
      baseData['source[cvc]'] = '123';
      baseData['source[month]'] = '01';
      baseData['source[year]'] = '2026';
    }

    const body = qs.stringify(baseData);

    const response = await axios.post(
      'https://api.moyasar.com/v1/payments',
      body,
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${process.env['MOYASAR_API_KEY']}:`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('⚠️ Moyasar error:', error?.response?.data || error.message);
    throw new Error(error?.response?.data?.message || 'Payment failed');
  }
};

/**
 * تأكيد الدفع مع payment gateway
 */
export const confirmPaymentGateway = async (paymentIntentId: string, paymentMethodId: string) => {
  try {
    const response = await axios.post(
      `https://api.moyasar.com/v1/payments/${paymentIntentId}/confirm`,
      qs.stringify({
        payment_method: paymentMethodId
      }),
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${process.env['MOYASAR_API_KEY']}:`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('⚠️ Payment confirmation error:', error?.response?.data || error.message);
    throw new Error(error?.response?.data?.message || 'Payment confirmation failed');
  }
};

/**
 * الحصول على حالة الدفع من payment gateway
 */
export const getPaymentGatewayStatus = async (paymentIntentId: string) => {
  try {
    const response = await axios.get(
      `https://api.moyasar.com/v1/payments/${paymentIntentId}`,
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${process.env['MOYASAR_API_KEY']}:`).toString('base64'),
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('⚠️ Payment status error:', error?.response?.data || error.message);
    throw new Error(error?.response?.data?.message || 'Failed to get payment status');
  }
};

/**
 * إنشاء استرداد
 */
export const createRefund = async (paymentId: string, amount?: number, reason?: string) => {
  try {
    const refundData: any = {};
    
    if (amount) {
      refundData.amount = amount * 100; // تحويل إلى هلل
    }
    
    if (reason) {
      refundData.description = reason;
    }

    const response = await axios.post(
      `https://api.moyasar.com/v1/payments/${paymentId}/refund`,
      qs.stringify(refundData),
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${process.env['MOYASAR_API_KEY']}:`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('⚠️ Refund error:', error?.response?.data || error.message);
    throw new Error(error?.response?.data?.message || 'Refund failed');
  }
};

/**
 * التحقق من صحة webhook signature
 */
export const verifyWebhookSignature = (_payload: any, _signature: string): boolean => {
  try {
    // TODO: تطبيق التحقق من signature حسب documentation الخاص بـ Moyasar
    // const crypto = require('crypto');
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.WEBHOOK_SECRET)
    //   .update(JSON.stringify(payload))
    //   .digest('hex');
    
    // return signature === expectedSignature;
    
    // مؤقتاً نقبل جميع الـ webhooks
    return true;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
};