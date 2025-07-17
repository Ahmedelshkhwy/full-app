/**
 * معالجة الدفع - الدالة الأساسية
 */
export declare const processPayment: (total: number, method: string) => Promise<any>;
/**
 * تأكيد الدفع مع payment gateway
 */
export declare const confirmPaymentGateway: (paymentIntentId: string, paymentMethodId: string) => Promise<any>;
/**
 * الحصول على حالة الدفع من payment gateway
 */
export declare const getPaymentGatewayStatus: (paymentIntentId: string) => Promise<any>;
/**
 * إنشاء استرداد
 */
export declare const createRefund: (paymentId: string, amount?: number, reason?: string) => Promise<any>;
/**
 * التحقق من صحة webhook signature
 */
export declare const verifyWebhookSignature: (_payload: any, _signature: string) => boolean;
